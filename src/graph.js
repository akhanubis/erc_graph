/*
TODO:
element info con todos los balances
labels en links
filtrar por tokens
usar thegraph para traer lista de exchnages de uniswap, balancer, etc y con eso poder tagear y colorear nodos
obtener internal tx usando https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=0x0414c8df68b8086a36c3c7990196ab9c48fa455678b132094b085d9091656b05&apikey=YourApiKeyToken
chequear https://etherscan.io/tx/0xc82a33cb8ccaae9807cab35fd9e37e0ea9eeccf98c60bd669f5c48d7d5eda1d3
*/
import "regenerator-runtime/runtime.js"
import React, { PureComponent } from 'react'
import { render } from 'react-dom'
import web3 from 'web3'
import * as d3 from 'd3'
import BigNumber from 'bignumber.js'
import ERC20 from './ERC20'
import Fps from './Fps'
import Gas from './Gas'
import LoadingPanel from './LoadingPanel'
import Drawer from './VectorDrawer'
import DataUtils from './data_utils'
import { filterInPlace } from './utils'
import 'babel-polyfill'

import './css/index.css'

const
  TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  WETH_WRAP_TOPIC = '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
  WETH_UNWRAP_TOPIC = '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
  WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  SEMANTIC_ZOOM_TRESHOLD = 1.5,
  DEFAULT_HOVER_COLOR = '#000000',
  FPS_UPDATE_WINDOW = 30

const hextoAscii = hex => {
  let str = ''
  for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  return str
}

const fetch_token_metadata = (_ => {
  const metadata_cache = {
    ETH: {
      address: '',
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18
    }
  }
  return async address => {
    if (metadata_cache[address])
      return metadata_cache[address]

    const contract_string = new window.web3.eth.Contract(ERC20.string, address),
          contract_bytes32 = new window.web3.eth.Contract(ERC20.bytes32, address)

    const [name, symbol, decimals] = await Promise.all([
      contract_string.methods.name().call().catch(async _ => {
        const hex_string = await contract_bytes32.methods.name().call().catch(_ => '')
        return hextoAscii(hex_string)
      }),
      contract_string.methods.symbol().call().catch(async _ => {
        const hex_string = await contract_bytes32.methods.symbol().call().catch(_ => '')
        return hextoAscii(hex_string)
      }),
      contract_string.methods.decimals().call().catch(_ => {
        return contract_bytes32.methods.decimals().call().catch(_ => -1)
      })
    ])
    const metadata = {
      address,
      symbol,
      name,
      decimals: parseInt(decimals)
    }
    metadata_cache[address] = metadata
    return metadata
  }
})()

const link_key = transfer => transfer.sender > transfer.receiver ? `${ transfer.sender }_${ transfer.receiver }` : `${ transfer.receiver }_${ transfer.sender }`

const start_web3 = _ => {
  if (!window.ethereum) {
    alert('Missing MetaMask')
    return
  }

  window.web3 = new web3(window.ethereum)
  window.ethereum.enable()
  return true
}

class App extends PureComponent {
  constructor() {
    super()
    const url_params = new URLSearchParams(window.location.search)

    this.transaction_hash = url_params.get('hash')
    this.initialized = false
    this.tokens_metadata = {}
    this.fps = 0
    this.force = null
    this.links = []
    this.nodes = []
    this.address_to_node = {}
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
      loading: true
    }
  }

  async componentDidMount() {
    this.main_ctx = this.canvas.getContext('2d', {
      desynchronized: true,
      willReadFrequently: false
    })
    this.main_drawer = new Drawer(this.main_ctx, DEFAULT_HOVER_COLOR)

    this.force = d3.forceSimulation()
      .force("charge", d3.forceManyBody().distanceMax(50000).strength(n => -20 - 30 * 2 * (n.radius - 5)))
      .force("link", d3.forceLink(this.links).distance(60).id(d => d.full_name))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("center", d3.forceCenter(0, 0))
      .alpha(1)
      .on('tick', () => {
        this.update_element_at_pointer('hovered_element')
        this.update_element_at_pointer('clicked_element', true)
      })
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

    if (!start_web3())
      return
    
    if (this.transaction_hash)
      await this.load_transaction(this.transaction_hash)
    else
      await this.load_block('latest')
    this.resize()
    this.restart_simulation()
    this.setState({ loading: false })

    this.previous_ts = window.performance.now()
    window.requestAnimationFrame(this.loop)
  }

  load_block = async bn => {
    const block = await window.web3.eth.getBlock(bn)
    await Promise.all(block.transactions.map(tx => this.load_transaction(tx)))
    console.log(`Block ${ block.number } loaded`)
  }

  load_transaction = async hash => {
    const receipt = await window.web3.eth.getTransactionReceipt(hash)

    const transfers = []
    for (const l of receipt.logs) {
      try {
        if (l.topics[0] === TRANSFER_TOPIC)
          transfers.push({
            token_address: l.address.toLowerCase(),
            sender: `0x${ l.topics[1].substr(26, 40) }`,
            receiver: `0x${ l.topics[2].substr(26, 40) }`,
            amount: new BigNumber(l.data)
          })
        else if (l.address.toLowerCase() === WETH_ADDRESS && l.topics[0] === WETH_WRAP_TOPIC) {
          const wrapper = `0x${ l.topics[1].substr(26, 40) }`,
                amount = new BigNumber(l.data)
          transfers.push({
            token_address: 'ETH',
            sender: wrapper,
            receiver: WETH_ADDRESS,
            amount
          })
          transfers.push({
            token_address: WETH_ADDRESS,
            sender: WETH_ADDRESS,
            receiver: wrapper,
            amount
          })
        }
        else if (l.address.toLowerCase() === WETH_ADDRESS && l.topics[0] === WETH_UNWRAP_TOPIC) {
          const unwrapper = `0x${ l.topics[1].substr(26, 40) }`,
                amount = new BigNumber(l.data)
          transfers.push({
            token_address: WETH_ADDRESS,
            sender: unwrapper,
            receiver: WETH_ADDRESS,
            amount
          })
          transfers.push({
            token_address: 'ETH',
            sender: WETH_ADDRESS,
            receiver: unwrapper,
            amount
          })
        }
      }
      catch(e) {
        console.log(`Error parsing tx ${ hash }`)
      }
    }

    await Promise.all(transfers.map(async t => {
      const metadata = await fetch_token_metadata(t.token_address)
      t.decimals = metadata.decimals
      t.name = metadata.name
      t.symbol = metadata.symbol
      this.tokens_metadata[t.token_address] = metadata
    }))

    const address_balances = {},
          links = {}
    for (const t of transfers) {
      address_balances[t.sender] = address_balances[t.sender] || {}
      address_balances[t.sender][t.token_address] = (address_balances[t.sender][t.token_address] || new BigNumber(0)).minus(t.amount)
      address_balances[t.receiver] = address_balances[t.receiver] || {}
      address_balances[t.receiver][t.token_address] = (address_balances[t.receiver][t.token_address] || new BigNumber(0)).plus(t.amount)
      const key = link_key(t)
      links[key] = links[key] || []
      links[key].push(t)
    }

    for (const address in address_balances) {
      if (!this.address_to_node[address]) {
        const node = {
          name: address.substr(0, 7),
          full_name: address,
          type: 'EOA',
          balances: {},
          radius: 30,
          color: this.main_drawer.node_color(address)
        }
        this.nodes.push(node)
        this.address_to_node[address] = node
      }
      for (const token_address in address_balances[address]) {
        const n = this.address_to_node[address]
        n.balances[token_address] = (n.balances[token_address] || new BigNumber(0)).plus(address_balances[address][token_address])
      }
    }

    for (const key in links) {
      const [source, target] = key.split('_'),
            ts = links[key]
      const source_amounts = {},
            target_amounts = {}
      for (const t of ts) {
        source_amounts[t.token_address] = (source_amounts[t.token_address] || new BigNumber(0))[t.sender === source ? 'minus' : 'plus'](t.amount)
        target_amounts[t.token_address] = (target_amounts[t.token_address] || new BigNumber(0))[t.sender === target ? 'minus' : 'plus'](t.amount)
      }
      
      this.links.push({
        source,
        target,
        transfers: ts,
        width: 1,
        loop: source === target,
        type: 'link',
        source_label: Object.entries(source_amounts).map(([token_address, amount]) => `${ this.tokens_metadata[token_address].symbol }: ${ amount.times(Math.pow(10, -1 * this.tokens_metadata[token_address].decimals)).toFixed(3) }`).join(', '),
        target_label: Object.entries(target_amounts).map(([token_address, amount]) => `${ this.tokens_metadata[token_address].symbol }: ${ amount.times(Math.pow(10, -1 * this.tokens_metadata[token_address].decimals)).toFixed(3) }`).join(', ')
      })
    }
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
    const visible_nodes = [...this.nodes],
          visible_links = [...this.links]
    if (this.zoom_transform.k > 0.25) {
      filterInPlace(visible_nodes, this.should_render_node)
      filterInPlace(visible_links, this.should_render_link)
    }
    visible_nodes.forEach(this.transform_node)

    this.main_ctx.textAlign = 'center'
    this.main_drawer.draw(this.drawing_scale, visible_nodes, visible_links)
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

  restart_simulation = _ => {
    this.force.nodes(this.nodes)
    this.force.force("link").links(this.links.sort((a, b) => a.width - b.width)) /* from thinnest to widest so widest get drawn last */
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
    let node = this.find_collider(this.nodes, this.mouse_pointer, DataUtils.point_circle_collision)
    if (node)
      return node
    else
      return this.find_collider(this.links, this.mouse_pointer, DataUtils.point_link_collision)
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
    const { fps, loading } = this.state 
    return ([
      <div className='main-container' key="1">
        <div className="canvas-container">
          <canvas className="main-canvas" ref={c => this.canvas = c}/>
          <Fps fps={fps}/>
          <Gas />
        </div>
      </div>,
      <LoadingPanel key="2" loading={loading}/>
    ])
  }
}

render(<App />, document.getElementById('root'))