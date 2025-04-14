## Public Bid Tracker for Everquest - Project Quarm

This program is designed for loot officers to keep track of bids for multiple items and eventually to streamline the management of DKP on Open DKP.

### Requirements

You must have the latest version of [Zeal](https://github.com/iamclint/Zeal) installed to use this program. This program uses Zeal pipes to manage bids in the guild chat channel.

### TODO

- Document and setup busnag for error logging
- Need settings window to store open dkp client credentials

### Loot Officer Responsibilities

- It is the loot officer's responsibility to verify the person bidding is in the raid and has enough DKP. This program will not keep track of that for now.
- This program is stateless, it will only track bidding events that were started when you have the program running and the game is also running. It is recommended multiple loot officers are running the program simultaneously.
- This program currently does not have an integration with OpenDKP. You will still have to manually adjust DKP for winning bids.

### Application Functionality

- This application has no backing database and all bidding data is temporary. It is recommended multiple loot officers run the application just in case the main loot officer disconnects from the game in the middle of bidding an item out.

- (optional) You can copy / paste the winner message to a notepad instead of trying to keep track of DKP in real time. At the end of a raid you can then refer to that notepad to adjust everyone's DKP.

- Bids for multiple items must be done by repeating the same START BIDS message, 1 per copy of the item, currently.

- The app does not currently support bid priority for things like epics or quests. Expectations for items like this will need to be set with the guild in voice comms or in guild chat separately.

- Other players can also use the bid tool to keep track of which bids there are. However, they will not be able to start or close bids, declare winners, or generate bid reports.

- Players will only be able to bid on one copy of an item even if there are multiple available. Loot officers should bid out each separately if they want to make an exception to this.

- You will have to modify this application's config file if you want to include new loot officers to manage bids using this application. The permission is granted based on the player's name in game.

- This application only tracks bidding activity in guild chat.

- Starting a bid happens when a loot officer puts a message in guild chat in the following format: `START BIDS <ITEM_LINK>` Where <ITEM_LINK> is a link to the item you are bidding.

- The application will not work well with links from PQDI. You must use links from in game items to start, close, or place bids.

- Starting a bid adds item to the auction list with a 90 second timer, which is configurable in the app's configuration file in %APPDATA%.

- Starting multiple auctions for the same item groups them together in the application and the top bids win the items.

- This application only tracks winners when the bid starts. If you start bids on one item and then 30 seconds later start a bid for the same item, the application will not retroactively look at all previous bids to find the next highest bid. Players are expected to bid again as if it is a new bid. It is recommended that loot officers try to start bids for multiple items as close together as possible. If this becomes confusing it might be better to just wait for the current bidding to close and then start a new bidding session for the second item.

- Players bid on items by typing a message in the guild chat in the following format: `BID <ITEM_LINK> <BID_AMOUNT>`. Ex: Bid Mithril Vambraces 1 will bid 1 DKP on Mithril Vambraces.

- You may close a bid at any time by clicking the close bid button. Bids do not automatically close when the timer reaches 0.

- Clicking the close bid button copies a message to your clipboard. The message is in the following format:
  `BIDS CLOSED <ITEM_LINK>` where <ITEM_LINK> is a link to the item you are closing bids on. Entering this message into guild chat is what officially closes bidding.

- Closing a bid for an item stops all bidding for that item, even if there were multiple copies of that item.

- When bids officially close a new button will appear to declare the winner. Clicking this button copies a message to your clipboard. Entering this message into guild chat will declare who won the item and for how much DKP. After 15 seconds of declaring the winner, the item will be removed from the tracker. It is recommended you copy this winner message to notepad or excel to maintain an audit of who won what item. You could also look at your character's log file in your game directory if you lose this information.

- If there are no bids when bidding closes, the item will be removed from the tracker after 15 seconds.

- Loot officers have an extra feature to generate a bid report. This will copy text to your clipboard to indicate what items are currently being bid out, who the highest bidder is at the moment, and how much time is left. You can paste this text in guild chat to let everyone know what the current status is.
