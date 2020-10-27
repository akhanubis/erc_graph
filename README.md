![Cover](/src/assets/cover.png)

*Built for ETHOnline 2020 hackaton: https://hack.ethglobal.co/showcase/ercgraph-recLJF7p1U4VzRA12*

**Short Description**

[Site](https://ercgraph.live) is a real-time and historic graph showing ERC20 transfers accross the Ethereum network

**Long Description**

ERCGraph is a real-time and historic graph showing ERC20 transfers accross the Ethereum network.
It listens for and retrieves past ERC-20 Transfer event logs to plot them on a canvas to make it easy to understand complex transactions or network events.
The user can make annotations and filter data by different criterias: protocol, token being transferred, sender or receiver address and amount being transferred.

**How It's Made**

ERCGraph uses:
Metamask and Pocket Network to get ERC-20 data.
The Graph to fetch Uniswap, Balancer and Sushiswap pools information and label them on the background.
ENS to reverse lookup addresses and get a human readable name.
d3 to simulate the forces model that is applied to the nodes and links.
A canvas drawing engine I coded with a focus on performance that allows the app to plot thousands of transfers with good enough FPS.
Various filters to customize the user experience and help both casual and data science related users get the information they want.

**To run**

```
1. npm install
2. npm run local
```
