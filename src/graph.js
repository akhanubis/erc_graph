/*
sidebar
UI de filtrar por tokens, checkbox para que muestre o no otros transfers dentro de mismo link, el checkbox define si se usa filtered o no para transfers
UI de filtrar por from y to de la transfer
UI de filtrar por from y to de la tx

filter by transfer amount

nice to have:
obtener internal tx usando https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=0x0414c8df68b8086a36c3c7990196ab9c48fa455678b132094b085d9091656b05&apikey=YourApiKeyToken
filter para filtrar por address y poder traer history mas facil
filter para filtrar por token y poder traer history mas facil
backend to request everything only once

remover bloq viejos, considerar guardar lista de txs hash por bloq y al momento de sacar aprovechando que cada transfer tiene su hash
guardo tx hashes por bloq num
para remove, voy limpiando los transfers cuyo hash es del bloque a sacar
desp borro links que quedaron en 0 transfers
desp agrego bloq nuevo
desp recalc balances de links
desp recalc balances de nodos 
desp borro nodos que no tienen keys en balance
*/
import "regenerator-runtime/runtime.js"
import React, { PureComponent } from 'react'
import { render } from 'react-dom'
import web3 from 'web3'
import * as d3 from 'd3'
import BigNumber from 'bignumber.js'
import Fps from './Fps'
import Gas from './Gas'
import LoadingPanel from './LoadingPanel'
import Drawer from './VectorDrawer'
import DataUtils from './data_utils'
import TokensMetadata from './TokensMetadata'
import ElementInfo from './ElementInfo'
import { filterInPlace, promisesInChunk } from './utils'
import { addressName, addressLabel, addressColor, reverseENS } from './address_label'
import { BY_PROTOCOL, loadSubgraphs } from './known_addresses'
import pSBC from './psbc'
import 'babel-polyfill'

import './css/bootstrap.min.css'
import './css/graph.css'

const
  TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  WETH_WRAP_TOPIC = '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
  WETH_UNWRAP_TOPIC = '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
  WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  SEMANTIC_ZOOM_TRESHOLD = 1.5,
  DEFAULT_HOVER_COLOR = '#000000',
  FPS_UPDATE_WINDOW = 30,
  DEFAULT_HISTORY_SIZE = 2,
  METAMASK_ENABLED = window.ethereum,
  POCKET_MAX_CONCURRENCY = 50,
  METAMASK_MAX_CONCURRENCY = 500

const link_key = transfer => transfer.sender > transfer.receiver ? `${ transfer.sender }_${ transfer.receiver }` : `${ transfer.receiver }_${ transfer.sender }`

const start_web3 = _ => {
  if (METAMASK_ENABLED) {
    window.web3 = new web3(window.ethereum)
    window.ethereum.enable()
  }
  else {
    window.web3 = new web3(POCKET_RPC_URL)
    console.log('No MetaMask detected, using Pocket Network')
  }
}

const sort_transfers = (a, b) => a.block_number === b.block_number ? (a.log_index - b.log_index) : (a.block_number - b.block_number)

const query_string_to_address_list = value => (value || '').split(',').map(a => a.trim()).filter(a => a)

class App extends PureComponent {
  constructor() {
    super()
    const url_params = new URLSearchParams(window.location.search)

    this.transaction_hash = url_params.get('hash')
    this.resolve_ens = url_params.get('ens') === 'true'
    this.initialized = false
    this.pending_logs = []
    this.tokens_metadata = {}
    this.fps = 0
    this.force = null
    this.links = []
    this.nodes = []
    this.receipts = {}
    this.filtered_links = []
    this.filtered_nodes = []
    this.filtered_hashes = {}
    this.address_to_node = {}
    this.link_key_to_link = {}
    this.mouse_pointer = {
      x: 0,
      y: 0
    }
    this.fps_display_tick = 0
    this.fps_elapsed_accum = 0
    this.pixel_ratio = parseFloat(url_params.get('pixel_ratio') || window.devicePixelRatio)
    this.canvas = null
    this.main_ctx = null
    this.main_drawer = null

    this.state = {
      loading: true,
      from_to_tx_filter: {
        ...BY_PROTOCOL[url_params.get('filterFromToTxProtocol')]
      },
      from_to_transfer_filter: {
        ...BY_PROTOCOL[url_params.get('filterFromToTransferProtocol')]
      },
      tokens_filter: {}
    }

    for (const address of query_string_to_address_list(url_params.get('filterFromToTx')))
      this.state.from_to_tx_filter[address] = true

    for (const address of query_string_to_address_list(url_params.get('filterFromToTransfer')))
      this.state.from_to_transfer_filter[address] = true

    for (const address of query_string_to_address_list(url_params.get('filterTokens')))
      this.state.tokens_filter[address] = true

    this.url_params = url_params
  }

  async componentDidMount() {
    this.main_ctx = this.canvas.getContext('2d', {
      desynchronized: true,
      willReadFrequently: false
    })
    this.main_ctx.textAlign = 'center'
    this.main_drawer = new Drawer(this.main_ctx, DEFAULT_HOVER_COLOR)

    this.force = d3.forceSimulation()
      .force("charge", d3.forceManyBody().distanceMax(50000).strength(n => -20 - 30 * 2 * (n.radius - 5)))
      .force("link", d3.forceLink(this.filtered_links).distance(150).id(d => d.identifier))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("center", d3.forceCenter(0, 0))
      .alpha(1)
      .on('tick', () => {
        if (!this.state.force_running)
          this.setState({ force_running: true })
        this.update_element_at_pointer('hovered_element')
        this.update_element_at_pointer('clicked_element', true)
      })
      .on('end', _ => this.setState({ force_running: false }))
      .stop()

    let drag_behavior = d3.drag()
      .container(this.canvas)
      .subject(this.node_dragged)
      .on("start", this.start_drag)
      .on("drag", this.dragged)
      .on("end", this.end_drag)

    this.zoom_transform = d3.zoomIdentity
    this.drawing_scale = 1
    this.zoom_behaviour = d3.zoom()
      .on('zoom', _ => this.new_zoom_transform = d3.event.transform)
      .filter(() => d3.event.type === 'wheel' || d3.event.type === 'touchstart' || d3.event.type === 'dblclick' || d3.event.button === 1)

    d3.select(this.canvas)
      .call(this.zoom_behaviour)
      .call(drag_behavior)
      .on('click', this.canvas_mousedown)
      .on('mousemove', this.canvas_mousemove)

    d3.select(window).on('resize', this.resize_and_restart)

    start_web3()

    if (this.transaction_hash) {
      await this.load_transaction(this.transaction_hash)
      this.setState({ loading: false })
      this.after_load()
    }
    else {
      this.listen_for_new_logs(this.url_params.get('fromBlock'), this.url_params.get('toBlock'), this.url_params.get('logAddress'))
      this.process_pending_logs()
    }
    this.resize()
    this.restart_simulation()
    
    this.previous_ts = window.performance.now()
    window.requestAnimationFrame(this.loop)

    loadSubgraphs(address => this.update_node_metadata(address))
  }

  listen_for_new_logs = async (from, to, address) => {
    to = parseInt(to) || 'latest'
    const latest_bn = to === 'latest' ? (await window.web3.eth.getBlock(to)).number : to
    from = from || latest_bn - DEFAULT_HISTORY_SIZE + 1

    const logs_params = {
      toBlock: to,
      topics: [[TRANSFER_TOPIC, WETH_WRAP_TOPIC, WETH_UNWRAP_TOPIC]]
    }
    if (address)
      logs_params.address = address

    if (METAMASK_ENABLED) {
      window.web3.eth.subscribe('logs', {
        fromBlock: from,
        ...logs_params
      }).on('data', log => this.pending_logs.push(log))
    }
    else {
      setInterval((_ => {
        let last_block = from - 1
        return async _ => {
          const latest_block = (await window.web3.eth.getBlock(to)).number
          if (latest_block <= last_block)
            return
          const logs = await window.web3.eth.getPastLogs({
            fromBlock: last_block + 1,
            ...logs_params
          })
          for (const l of logs)
            this.pending_logs.push(l)
          last_block = latest_block
        }
      })(), 10000)
    }
  }

  process_pending_logs = async _ => {
    const logs = this.pending_logs.splice(0)
    if (logs.length) {
      const new_txs = logs.map(l => l.transactionHash).filter(h => !this.receipts[h]),
            unique_new_txs = {}
      for (const tx of new_txs)
        unique_new_txs[tx] = true
      // if (logs.length)
      //   this.setState({ loading: true })
      await promisesInChunk(Object.keys(unique_new_txs), METAMASK_ENABLED ? METAMASK_MAX_CONCURRENCY : POCKET_MAX_CONCURRENCY, this.load_transaction)
      this.setState({ loading: false })
      this.after_load()
      this.restart_simulation()
    }
    setTimeout(this.process_pending_logs, 1000)
  }

  load_transaction = async hash => {
    const receipt = await window.web3.eth.getTransactionReceipt(hash)
    if (!receipt)
      return
    this.receipts[hash] = receipt

    const transfers = [],
          logs = receipt.logs || []
    
    if (!logs.length)
      return
    for (let i = 0; i < logs.length; i++) {
      const l = logs[i]
      try {
        const transfer_data = {
          amount: new BigNumber(l.data),
          transaction_hash: hash,
          block_number: receipt.blockNumber,
          log_index: i
        }
        if (l.topics[0] === TRANSFER_TOPIC)
          transfers.push({
            token_address: l.address.toLowerCase(),
            sender: `0x${ l.topics[1].substr(26, 40) }`,
            receiver: `0x${ l.topics[2].substr(26, 40) }`,
            ...transfer_data
          })
        else if (l.address.toLowerCase() === WETH_ADDRESS && l.topics[0] === WETH_WRAP_TOPIC)
          transfers.push({
            token_address: WETH_ADDRESS,
            sender: WETH_ADDRESS,
            receiver: `0x${ l.topics[1].substr(26, 40) }`,
            ...transfer_data
          })
        else if (l.address.toLowerCase() === WETH_ADDRESS && l.topics[0] === WETH_UNWRAP_TOPIC)
          transfers.push({
            token_address: WETH_ADDRESS,
            sender: `0x${ l.topics[1].substr(26, 40) }`,
            receiver: WETH_ADDRESS,
            ...transfer_data
          })
      }
      catch(e) {
        console.log(`Error parsing tx ${ hash }`)
      }
    }

    await Promise.all(transfers.map(t => TokensMetadata.fetch(t.token_address)))

    const links = {},
          addresses = {}
          
    for (const t of transfers) {
      addresses[t.sender] = true
      addresses[t.receiver] = true
      const key = link_key(t)
      links[key] = links[key] || []
      links[key].push(t)
    }

    for (const address in addresses) {
      if (!this.address_to_node[address]) {
        const color = addressColor(address) || this.main_drawer.DEFAULT_COLOR
        const node = {
          label: addressLabel(address),
          name: addressName(address),
          identifier: address,
          identifiers: [address],
          address_type: 'EOA',
          type: 'address',
          radius: 30,
          color,
          outline_color: pSBC(-0.5, color)
        }
        this.nodes.push(node)
        this.address_to_node[address] = node
        this.fetch_address_metadata(address)
      }
    }

    for (const key in links) {
      const [source, target] = key.split('_')
      if (!this.link_key_to_link[key]) {
        const link = {
          name: `${ this.address_to_node[source].name } - ${ this.address_to_node[target].name }`,
          identifiers: [source, target],
          source,
          target,
          source_address: source,
          target_address: target,
          key,
          transfers: [],
          width: 1,
          loop: source === target,
          type: 'link'
        }
        this.links.push(link)
        this.link_key_to_link[key] = link
      }

      
      const l = this.link_key_to_link[key],
            ts = links[key]
      for (const t of ts)
        l.transfers.push(t)
    }
  }

  after_load = _ => {
    for (const n of this.nodes) {
      n.balances = {}
      n.transfers = []
    }

    for (const l of this.links) {
      const [source, target] = l.key.split('_'),
            source_amounts = {},
            target_amounts = {},
            source_transfers = [],
            target_transfers = [],
            source_icons_hash = {},
            target_icons_hash = {}

      l.transfers.sort(sort_transfers)

      for (const t of l.transfers) {
        source_amounts[t.token_address] = (source_amounts[t.token_address] || new BigNumber(0))[t.sender === source ? 'minus' : 'plus'](t.amount)
        target_amounts[t.token_address] = (target_amounts[t.token_address] || new BigNumber(0))[t.sender === target ? 'minus' : 'plus'](t.amount)
        if (t.sender === source) {
          source_transfers.push(t)
          source_icons_hash[t.token_address] = true
        }
        else {
          target_transfers.push(t)
          target_icons_hash[t.token_address] = true
        }
      }
      const source_icons = Object.keys(source_icons_hash),
            target_icons = Object.keys(target_icons_hash)
      l.source_amounts = source_amounts
      l.filtered_source_amounts = source_amounts
      l.target_amounts = target_amounts
      l.filtered_target_amounts = target_amounts
      l.source_icons = source_icons
      l.filtered_source_icons = source_icons
      l.target_icons = target_icons
      l.filtered_target_icons = target_icons
      l.filtered_transfers = l.transfers

      const source_balances = this.address_to_node[source].balances,
            target_balances = this.address_to_node[target].balances,
            source_node_transfers = this.address_to_node[source].transfers,
            target_node_transfers = this.address_to_node[target].transfers
      this.address_to_node[source].balances = source_balances
      this.address_to_node[target].balances = target_balances
      this.address_to_node[source].transfers = source_node_transfers
      this.address_to_node[target].transfers = target_node_transfers
      for (const token_address in source_amounts)
        source_balances[token_address] = (source_balances[token_address] || new BigNumber(0)).plus(source_amounts[token_address])
      for (const token_address in target_amounts)
        target_balances[token_address] = (target_balances[token_address] || new BigNumber(0)).plus(target_amounts[token_address])
      for (const t of l.transfers) {
        source_node_transfers.push(t)
        target_node_transfers.push(t)
      }
      source_node_transfers.sort(sort_transfers)
      target_node_transfers.sort(sort_transfers)
    }
  }

  fetch_address_metadata = async address => {
    const code = await window.web3.eth.getCode(address)
    if (code !== '0x') {
      const n = this.address_to_node[address]
      n.address_type = 'contract'
      n.color = n.color === this.main_drawer.DEFAULT_COLOR ? this.main_drawer.node_color(n) : n.color
      n.outline_color = pSBC(-0.5, n.color)
    }

    if (this.resolve_ens) {
      const name = await reverseENS(address)
      if (name) {
        n.label = name
        n.name = name
      }
    }
  }

  update_node_metadata = address => {
    const node = this.address_to_node[address]
    if (!node)
      return
    node.label = addressLabel(address)
    node.name = addressName(address)
    node.color = addressColor(address)
    node.outline_color = pSBC(-0.5, node.color)
  }

  loop = ts => {
    window.requestAnimationFrame(this.loop)
    const elapsed = ts - this.previous_ts
    this.previous_ts = ts
    if (!this.state.loading) {
      /* zoom changed since last loop, update */
      if (this.new_zoom_transform) {
        this.zoom_transform = this.new_zoom_transform
        this.drawing_scale = this.zoom_transform.k > SEMANTIC_ZOOM_TRESHOLD ? SEMANTIC_ZOOM_TRESHOLD / this.zoom_transform.k : 1
        this.update_viewport_boundaries()
        this.new_zoom_transform = null
      }
      this.draw()
      this.draw_outlines()
      this.draw_fps(elapsed)
    }
  }

  transform_node = n => {
    let transformed = this.zoom_transform.apply([n.x, n.y])
    n.trans_x = transformed[0]
    n.trans_y = transformed[1]
  }

  draw = _ => {
    const visible_nodes = [...this.filtered_nodes],
          visible_links = [...this.filtered_links]
    if (this.zoom_transform.k > 0.25) {
      filterInPlace(visible_nodes, this.should_render_node)
      filterInPlace(visible_links, this.should_render_link)
    }
    visible_nodes.forEach(this.transform_node)

    this.main_drawer.draw(this.drawing_scale, visible_nodes, visible_links, this.zoom_transform.k > 0.2, this.drawing_scale > 0.5 && this.zoom_transform.k > 0.4)
  }

  draw_outlines = _ => {
    this.draw_outline_element(this.state.hovered_element, true, false)
    this.draw_outline_element(this.state.clicked_element, false, true)
  }

  draw_outline_element = (element, hovered, clicked) => {
    if (!element)
      return
    if (element.width)
      this.main_drawer.draw_link(element, hovered, clicked)
    if (element.radius)
      this.main_drawer.draw_node(element, hovered, clicked)
  }

  draw_fps = elapsed => {
    this.fps_elapsed_accum += elapsed
    this.fps_display_tick++
    if (this.fps_display_tick % FPS_UPDATE_WINDOW)
      return
    this.setState({ fps: Math.floor(1000 * FPS_UPDATE_WINDOW / this.fps_elapsed_accum) })
    this.fps_elapsed_accum = 0
  }

  resize_and_restart = _ => {
    this.resize()
    this.restart_forces()
  }

  resize = _ => {
    this.canvas.width = this.canvas.clientWidth * this.pixel_ratio
    this.canvas.height = this.canvas.clientHeight * this.pixel_ratio
    this.update_viewport_boundaries()
    this.setState({ viewport_size: { width: this.canvas.clientWidth, height: this.canvas.clientHeight } })
    this.force.force('center', d3.forceCenter(0.5 * this.canvas.clientWidth, 0.5 * this.canvas.clientHeight))
  }

  filter_links_by_from_to_transfer = links => {
    if (this.has_from_to_transfer_filter())
      filterInPlace(links, l => this.state.from_to_transfer_filter[l.source_address] || this.state.from_to_transfer_filter[l.target_address] || this.state.from_to_transfer_filter[l.source.name] || this.state.from_to_transfer_filter[l.target.name])
    return links
  }

  filter_links_by_address = links => {
    if (!this.has_from_to_tx_filter())
      return links
    this.filtered_hashes = {}
    for (const r of Object.values(this.receipts))
      if (this.state.from_to_tx_filter[r.from] || this.state.from_to_tx_filter[r.to])
        this.filtered_hashes[r.transactionHash] = true
    filterInPlace(links, l => l.transfers.some(tf => this.filtered_hashes[tf.transaction_hash]))
    return links
  }

  filter_links_by_token = links => {
    if (!this.has_token_filter())
      return links
    filterInPlace(links, l => l.transfers.some(tf => this.state.tokens_filter[tf.token_address]))
    return links
  }

  filter_links = links => {
    const copy = [...links]
    const filtered = this.filter_links_by_address(this.filter_links_by_token(this.filter_links_by_from_to_transfer(copy)))
    return filtered
  }

  filter_nodes = (nodes, remaining_links) => {
    const remaining_addresses = {}
    for (const l of remaining_links) {
      remaining_addresses[l.source_address] = true
      remaining_addresses[l.target_address] = true
    }
    return nodes.filter(n => remaining_addresses[n.identifier])
  }

  unique_filters_state_id = _ => `${ this.filtered_nodes.map(n => n.identifier).sort().join('__') }____${ this.filtered_links.map(l => l.hash).sort().join('__') }`

  has_token_filter = _ => Object.keys(this.state.tokens_filter).length

  has_from_to_tx_filter = _ => Object.keys(this.state.from_to_tx_filter).length

  has_from_to_transfer_filter = _ => Object.keys(this.state.from_to_transfer_filter).length

  filter_transfers = transfers => {
    return transfers.filter(tf => (!this.has_token_filter() || this.state.tokens_filter[tf.token_address]) && (!this.has_from_to_tx_filter() || this.filtered_hashes[tf.transaction_hash]))
  }

  restart_simulation = _ => {
    const filtered_links = this.filter_links(this.links),
          filtered_nodes = this.filter_nodes(this.nodes, filtered_links)
    this.filtered_nodes = filtered_nodes
    this.filtered_links = filtered_links

    const new_state = this.unique_filters_state_id()
    if (this.filters_prev_state === new_state)
      return
    this.filters_prev_state = new_state

    if (this.has_token_filter() || this.has_from_to_tx_filter()) {
      for (const n of this.filtered_nodes) {
        n.filtered_transfers = this.filter_transfers(n.transfers)
        n.filtered_balances = {}
        for (const t of n.filtered_transfers)
          n.filtered_balances[t.token_address] = (n.filtered_balances[t.token_address] || new BigNumber(0))[t.sender === n.identifier ? 'minus' : 'plus'](t.amount)
      }

      for (const l of this.filtered_links) {
        const source_amounts = {},
              target_amounts = {},
              source_icons = {},
              target_icons = {},
              source = l.source_address,
              target = l.target_address
        l.filtered_transfers = this.filter_transfers(l.transfers)
        for (const t of l.filtered_transfers) {
          source_amounts[t.token_address] = (source_amounts[t.token_address] || new BigNumber(0))[t.sender === source ? 'minus' : 'plus'](t.amount)
          target_amounts[t.token_address] = (target_amounts[t.token_address] || new BigNumber(0))[t.sender === target ? 'minus' : 'plus'](t.amount)
          if (t.sender === source)
            source_icons[t.token_address] = true
          else
            target_icons[t.token_address] = true
        }
        l.filtered_source_amounts = source_amounts
        l.filtered_target_amounts = target_amounts
        l.filtered_source_icons = Object.keys(source_icons)
        l.filtered_target_icons = Object.keys(target_icons)
      }
    }
    else {
      for (const n of this.filtered_nodes) {
        n.filtered_balances = n.balances
        n.filtered_transfers = n.transfers
      }
      for (const l of this.filtered_links) {
        l.filtered_source_amounts = l.source_amounts
        l.filtered_target_amounts = l.target_amounts
        l.filtered_source_icons = l.source_icons
        l.filtered_target_icons = l.target_icons
        l.filtered_transfers = l.transfers
      }
    }

    this.filtered_links.sort((a, b) => a.width - b.width) /* from thinnest to widest so widest get drawn last */
    this.force.nodes(this.filtered_nodes)
    this.force.force("link").links(this.filtered_links)
    this.restart_forces()
  }

  restart_forces = _ => {
    this.force.alpha(1).restart()
  }

  update_viewport_boundaries = _ => {
    this.main_ctx.setTransform(this.pixel_ratio, 0, 0, this.pixel_ratio, 0, 0)
    this.main_ctx.translate(this.zoom_transform.x, this.zoom_transform.y)
    this.main_ctx.scale(this.zoom_transform.k, this.zoom_transform.k)
    this.viewport_bb = {
      min: this.zoom_transform.invert([0, 0]),
      max: this.zoom_transform.invert([this.canvas.width, this.canvas.height])
    }
    this.update_element_at_pointer('hovered_element')
    this.update_element_at_pointer('clicked_element', true)
  }

  update_element_at_pointer = (state_attr, force) => {
    let current_element = this.state[state_attr]
    let new_element = force ? current_element : this.element_at_pointer()
    if (new_element === current_element && !force)
      return
    let t = {}
    t[state_attr] = new_element
    t[`${ state_attr }_ts`] = new Date().getTime()
    this.setState(t)
    return true
  }

  element_at_pointer = () => {
    /* traverse in reverse because the ones on top are the ones that were drawn last */
    let node = this.find_collider(this.filtered_nodes, this.mouse_pointer, DataUtils.point_circle_collision)
    if (node)
      return node
    else
      return this.find_collider(this.filtered_links, this.mouse_pointer, DataUtils.point_link_collision)
  }

  find_collider = (list, point, collision_fn) => {
    for (let i = list.length - 1; i > - 1; i--)
      if (collision_fn(point, list[i], this.drawing_scale))
        return list[i]
  }

  update_mouse_pointer = () => {
    let coords = d3.event.sourceEvent ? [d3.event.sourceEvent.x, d3.event.sourceEvent.y] : [d3.event.x, d3.event.y]
    coords = this.zoom_transform.invert(coords)
    this.mouse_pointer = {
      x: coords[0],
      y: coords[1]
    }
    this.update_element_at_pointer('hovered_element')
  }

  canvas_mousemove = _ => {
    this.update_mouse_pointer()
  }

  canvas_mousedown = _ => {
    this.update_element_at_pointer('clicked_element')
  }

  node_dragged = () => {
    let inverted = this.zoom_transform.invert([d3.event.x, d3.event.y])
    return this.force.find(inverted[0], inverted[1], 30)
  }

  start_drag = () => {
    this.canvas_mousedown()
    let event = d3.event
    this.on_drag_start_timeout = setTimeout(_ => {
      if (!event.active)
        this.force.alphaTarget(0.1).restart()
      event.subject.fx = event.x
      event.subject.fy = event.y
    }, 100)
  }

  dragged = () => {
    this.canvas_mousemove()
    d3.event.subject.fx = this.mouse_pointer.x
    d3.event.subject.fy = this.mouse_pointer.y
  }

  end_drag = () => {
    clearTimeout(this.on_drag_start_timeout)
    if (!d3.event.active)
      this.force.alphaTarget(0)
  }

  should_render_node = n => n.x  + n.radius > this.viewport_bb.min[0] && n.x - n.radius < this.viewport_bb.max[0] && n.y + n.radius > this.viewport_bb.min[1] && n.y - n.radius < this.viewport_bb.max[1]
  
  should_render_link = l => {
    let min_x, max_x, min_y, max_y
    if (l.source.x < l.target.x) {
      min_x = l.source.x
      max_x = l.target.x
    }
    else {
      min_x = l.target.x
      max_x = l.source.x
    }
    if (l.source.y < l.target.y) {
      min_y = l.source.y
      max_y = l.target.y
    }
    else {
      min_y = l.target.y
      max_y = l.source.y
    }
    return max_x > this.viewport_bb.min[0] && min_x < this.viewport_bb.max[0] && max_y > this.viewport_bb.min[1] && min_y < this.viewport_bb.max[1]
  }

  render() {
    const current_alpha = this.force ? this.force.alpha() : 1
    const { fps, loading, force_running, viewport_size, clicked_element_ts, hovered_element, clicked_element,  } = this.state 
    return ([
      <div className='main-container' key="1">
        <div className="canvas-container">
          <canvas className="main-canvas" ref={c => this.canvas = c}/>
          <Fps fps={fps} running={force_running} alpha={current_alpha}/>
          <Gas />
          <ElementInfo transformation_matrix={this.zoom_transform} viewport_size={viewport_size} ts={clicked_element_ts /* force update */} element={clicked_element} default_color={DEFAULT_HOVER_COLOR} hidden={loading} />
          <ElementInfo transformation_matrix={this.zoom_transform} viewport_size={viewport_size} element={hovered_element} default_color={DEFAULT_HOVER_COLOR} hidden={loading || clicked_element === hovered_element} />
        </div>
      </div>,
      <LoadingPanel key="2" loading={loading}/>
    ])
  }
}

render(<App />, document.getElementById('root'))