<template>
  <nav>
    <div class="title">Quarm Bid Tracker</div>
    <div class="right-nav">
      <span class="nav-link" @click="minimize">&minus;</span>
      <span class="nav-link" @click="close">&#10006;</span>
    </div>
  </nav>
  <div class="main">
    <div class="actions">
      <v-btn
        prependIcon="mdi-chart-bar"
        class="action-button"
        size="small"
        @click="getReport"
        >Report</v-btn
      >
      <v-btn
        prependIcon="mdi-stop"
        class="action-button"
        size="small"
        @click="getCloseAllMessage"
        >Close All</v-btn
      >
      <v-btn
        prependIcon="mdi-trophy"
        class="action-button"
        size="small"
        @click="getDeclareAllWinnersMessage"
        >Declare All Winners</v-btn
      >
      <v-btn
        prependIcon="mdi-cog"
        class="action-button icon-button"
        size="icon"
        @click="toggleSettings"
      ></v-btn>
      <v-btn
        prependIcon="mdi-reload-alert"
        class="action-button icon-button"
        size="icon"
        @click="refreshPage"
      ></v-btn>
    </div>
    <auctionItem
      v-for="item in auctions"
      :key="item.dateCreated"
      :auction="item"
      @update:statusMessage="showStatusMessage"
    />
  </div>
  <div class="settings nodrag" v-if="isDisplaySettings">
    <v-text-field
      label="Discord Webhook URL"
      v-model="discordWebhookUrl"
    ></v-text-field>
    <v-btn size="small" @click="saveSettings">Save</v-btn>
    <span class="app-version"> v{{ appVersion }} </span>
  </div>
  <div class="test-harness nodrag" v-if="isTestHarness">
    <v-text-field label="player" v-model="testPlayer"></v-text-field>
    <v-text-field label="message" v-model="testMessage"></v-text-field>
    <v-btn size="small" @click="submitTest">Submit</v-btn>&nbsp;
  </div>
  <v-snackbar v-model="isStatusVisible" :timeout="3000">
    {{ statusMessage }}
    <template v-slot:actions>
      <v-btn
        class="snack-action"
        variant="text"
        @click="isStatusVisible = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { DataPipeType, PipeType, zealWindow } from "./zeal-window";
import auctionItem from "./auction-item.vue";
import { Auction, AuctionState } from "./auction";

const store = useStore();

onMounted(() => {
  zealWindow.zeal.getSettings();
  zealWindow.zeal.getVersion();
});

zealWindow.zeal.onSettingsLoaded((settings) => {
  store.commit("updateSettings", settings);
  isTestHarness.value = store.state.appSettings.bidTracker.testHarness;
  discordWebhookUrl.value =
    store.state.appSettings.bidTracker.discordWebhookUrl;
});

zealWindow.zeal.onVersionLoaded((version) => {
  appVersion.value = version;
});

zealWindow.zeal.onGetReportShortcut(() => {
  getReport();
});

zealWindow.zeal.onCloseAllShortcut(() => {
  getCloseAllMessage();
});

zealWindow.zeal.onDeclareAllWinnersShortcut(() => {
  getDeclareAllWinnersMessage();
});

const statusMessage = ref("");
const isStatusVisible = ref(false);
const isTestHarness = ref(false);

const appVersion = ref("");
const discordWebhookUrl = ref("");

const isDisplaySettings = ref(false);

const auctions = ref([]);
const currentCharacter = ref("");

const removalTimers = {};

const dc2 = String.fromCharCode(18);

// test parameters
const testPlayer = ref("");
const testMessage = ref("");

const minimize = async () => {
  zealWindow.zeal.minimize();
};

const close = async () => {
  zealWindow.zeal.close();
};

const getReport = () => {
  let activeAuctionsExist = auctions.value.some(
    (auction) => auction.state === AuctionState.Active
  );

  if (!activeAuctionsExist) {
    zealWindow.zeal.copyText("Current Bids ::: None");
  } else {
    let bidReport = "";
    for (let i = 0; i < auctions.value.length; i++) {
      let auction = auctions.value[i];

      if (auction.state !== AuctionState.Active) {
        continue;
      }

      if (!auction.winningBids || auction.winningBids.length === 0) {
        bidReport += `${i + 1}. ${auction.itemDisplay} NO BIDS ${
          auction.timeLeftSeconds
        }s`;
      } else {
        bidReport += `${i + 1}. ${auction.itemDisplay}`;
        for (const winningBid of auction.winningBids) {
          if (winningBid.player && winningBid.bid) {
            bidReport += ` ${winningBid.player} ${winningBid.bid}`;
          }
        }
        bidReport += ` - ${auction.timeLeftSeconds}s`;
      }

      if (i + 1 < auctions.value.length) {
        bidReport += ", ";
      }
    }

    zealWindow.zeal.copyText(`Current Bids ::: ${bidReport}`);
  }

  statusMessage.value = "Current bids copied to clipboard!";
  isStatusVisible.value = true;
};

const getCloseAllMessage = () => {
  let activeAuctionsExist = auctions.value.some(
    (auction) => auction.state === AuctionState.Active
  );

  if (!activeAuctionsExist) {
    statusMessage.value = "No bids to close at this time!";
    isStatusVisible.value = true;
    return;
  }

  let bidsClosedMessage = "BIDS CLOSED ";
  for (let i = 0; i < auctions.value.length; i++) {
    let auction = auctions.value[i];
    if (auction.state !== AuctionState.Active) {
      continue;
    }

    bidsClosedMessage += `${auction.itemDisplay}`;
    if (i + 1 < auctions.value.length) {
      bidsClosedMessage += ", ";
    }
  }

  zealWindow.zeal.copyText(bidsClosedMessage);

  statusMessage.value =
    "Close all current bids message copied to clipboard. Paste this in guild chat!";
  isStatusVisible.value = true;
};

const toggleSettings = () => {
  isDisplaySettings.value = !isDisplaySettings.value;
};

const refreshPage = () => {
  location.reload();
};

const getDeclareAllWinnersMessage = () => {
  let winningBidsExist = auctions.value.some(
    (auction) =>
      auction.state === AuctionState.Closed &&
      auction.winningBids &&
      auction.winningBids.length > 0
  );

  if (!winningBidsExist) {
    statusMessage.value = "No winning bids at this time!";
    isStatusVisible.value = true;
    return;
  }

  let winningBidText = "WINNING BIDS ";
  for (let i = 0; i < auctions.value.length; i++) {
    let auction = auctions.value[i];
    if (
      auction.state !== AuctionState.Closed ||
      auction.winningBids.length === 0
    ) {
      continue;
    }
    winningBidText += `${auction.itemDisplay} ::: `;
    for (let i = 0; i < auction.winningBids.length; i++) {
      const winningBid = auction.winningBids[i];
      if (!winningBid) {
        continue;
      }
      winningBidText += `${winningBid.player} ${winningBid.bid}`;

      if (i + 1 < auction.winningBids.length) {
        winningBidText += " | ";
      }
    }

    if (i + 1 < auctions.value.length) {
      winningBidText += ", ";
    }
  }

  zealWindow.zeal.copyText(winningBidText);

  statusMessage.value =
    "Declare all winners message copied to clipboard. Paste this in guild chat!";
  isStatusVisible.value = true;
};

const showStatusMessage = (message: string) => {
  statusMessage.value = message;
  isStatusVisible.value = true;
};

function findAllIndexes<T>(
  array: Array<T>,
  predicate: (value: T, index: number, obj: T[]) => boolean
): number[] {
  const indexes = [];
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) {
      indexes.push(l);
    }
  }
  return indexes;
}

const saveSettings = async () => {
  zealWindow.zeal.saveSettings(discordWebhookUrl.value);
  statusMessage.value = "Settings saved!";
  isStatusVisible.value = true;
};

const submitTest = async () => {
  const pipePlayer = {
    character: testPlayer.value,
    type: PipeType.Player
  };

  processPipe(pipePlayer);
  const pipe = {
    character: testPlayer.value,
    data: {
      type: DataPipeType.OtherGuildChat,
      text: testMessage.value
    },
    type: PipeType.Log,
    data_len: 1
  };

  processPipe(pipe);
};

const calculateWinningBids = (auction: Auction) => {
  // Group bids by player to ensure a player can only win one copy of an item
  const playerBids = auction.bids.reduce((acc, bid) => {
    if (!acc[bid.player]) {
      acc[bid.player] = bid;
    } else if (bid.bid > acc[bid.player].bid) {
      acc[bid.player] = bid; // Update to the highest bid for the player
    }
    return acc;
  }, {});

  // Convert grouped bids back to an array and sort
  auction.winningBids = Object.values(playerBids)
    .sort((a, b) => {
      if (a.bid !== b.bid) {
        return b.bid - a.bid; // Sort by bid amount in descending order
      }
      return a.date - b.date; // If bids are equal, sort by date in ascending order
    })
    .slice(0, auction.quantity); // Take the top bids based on the quantity

  // Reset the timer if close to ending
  if (auction.timeLeftSeconds < 20 && auction.timeLeftSeconds > 0) {
    auction.timeLeftSeconds = 30;
  }
};

const processPipe = (pipe: any) => {
  if (!pipe) {
    return;
  }

  if (pipe.type === PipeType.Player && currentCharacter.value === "") {
    // pipe.character gets the name of the character in game
    currentCharacter.value = pipe.character;
  } else if (
    pipe.type === PipeType.Log &&
    (pipe.data.type === DataPipeType.OtherGuildChat ||
      pipe.data.type === DataPipeType.YourGuildChat)
  ) {
    const bidStartEndregex =
      /^(?<player>.*) (say to your guild|tells the guild), '(START BIDS|BIDS CLOSED|WINNING BIDS) (?<item>.*)'/i;
    // match[0] - entire string
    // match[1] - name (You or player name)
    // match[2] - not used
    // match[3] - action
    // match[4] - item(s). It can be one item or multiple delimited by a comma if LINK ALL is used in game.

    const startOrEndMatch = pipe.data.text.match(bidStartEndregex);
    if (startOrEndMatch && startOrEndMatch.length === 5) {
      const bidItemsString = startOrEndMatch[4];
      if (
        !bidItemsString ||
        bidItemsString.trim().length === 0 ||
        bidItemsString.trim() === "bids"
      ) {
        return;
      }

      bidItemsString.split(/[,|]/).forEach((bidItem) => {
        // remove device control characters
        let itemString = bidItem.replace(/dc2/g, "").trim();

        const itemId = itemString.substring(0, 7);
        const itemName = itemString.substring(7).trim();

        const foundAuction = auctions.value.find(
          (item: Auction) => item.itemId === itemId
        );

        if (startOrEndMatch[3].toLowerCase() === "start bids") {
          // Add item to tracker
          if (foundAuction && foundAuction.state === AuctionState.Active) {
            foundAuction.quantity++;
          } else {
            let newAuction = {
              bids: [],
              winningBids: [],
              quantity: 1,
              itemId,
              itemName,
              itemDisplay: `${dc2}${itemId} ${itemName}${dc2}`,
              state: AuctionState.Active,
              dateCreated: Date.now(),
              timeLeftSeconds:
                store.state.appSettings.bidTracker.defaultTimerSeconds
            };
            auctions.value.push(newAuction);
          }
        } else if (startOrEndMatch[3].toLowerCase() === "bids closed") {
          if (foundAuction) {
            foundAuction.state = AuctionState.Closed;
            foundAuction.timeLeftSeconds = 0;

            if (
              !foundAuction.winningBids ||
              foundAuction.winningBids.length === 0
            ) {
              const currenTimers = Object.keys(removalTimers);
              if (!currenTimers.some((keyId) => keyId === itemId)) {
                foundAuction.finalCountdown = 10;
                let closeTimerId = setInterval(() => {
                  foundAuction.finalCountdown--;

                  if (foundAuction.finalCountdown <= 0) {
                    const foundAuctionIndex = auctions.value.findIndex(
                      (item: Auction) => item.itemId === itemId
                    );

                    auctions.value.splice(foundAuctionIndex, 1);
                    clearInterval(closeTimerId);
                    delete removalTimers[itemId];
                  }
                }, 1000);

                removalTimers[itemId] = closeTimerId;
              }
            }
          }
        } else if (startOrEndMatch[3].toLowerCase() === "winning bids") {
          if (foundAuction) {
            foundAuction.state = AuctionState.WinnerAnnounced;
            if (startOrEndMatch[1] === "You") {
              // only want the person who declared the winning bid to post the winners message to Discord
              let bidString = "";
              for (let i = 0; i < foundAuction.winningBids.length; i++) {
                const bid = foundAuction.winningBids[i];
                bidString += `${bid.player} ${bid.bid}`;
                if (i + 1 < foundAuction.winningBids.length) {
                  bidString += ", ";
                }
              }

              zealWindow.zeal.sendToDiscord(
                `${foundAuction.itemName} ::: ${bidString}`
              );
            }

            const currenTimers = Object.keys(removalTimers);
            if (!currenTimers.some((keyId) => keyId === itemId)) {
              foundAuction.finalCountdown = 10;
              let closeTimerId = setInterval(() => {
                foundAuction.finalCountdown--;

                if (foundAuction.finalCountdown <= 0) {
                  const foundAuctionIndex = auctions.value.findIndex(
                    (item: Auction) => item.itemId === itemId
                  );

                  auctions.value.splice(foundAuctionIndex, 1);
                  clearInterval(closeTimerId);
                  delete removalTimers[itemId];
                }
              }, 1000);
              removalTimers[itemId] = closeTimerId;
            }
          }
        }
      });
    } else {
      const bidRegex =
        /^(?<player>.*) (say to your guild|tells the guild), '(BID\s?)?(?<itemid>[0-9]{7})(?<item>.*?)(?<bid>[\d].*?)(?:[A-Za-z].*?)?'/i;
      // match[0] - entire string
      // match[1] - name (You or player name)
      // match[2] - not used
      // match[3] - the word 'bid' if provided, otherwise null
      // match[4] - item id
      // match[5] - the item name
      // match[6] - the bid amount
      const bidMatch = pipe.data.text.match(bidRegex);
      if (bidMatch && bidMatch.length >= 5) {
        const itemId = bidMatch[4].trim();
        let bidAmountString = bidMatch[6].trim();

        const bidAmount = parseInt(bidAmountString);
        if (bidAmount > 5000) {
          return;
        }

        const foundAuctionIdx = findAllIndexes(
          auctions.value,
          (item: Auction) => item.itemId === itemId
        );

        foundAuctionIdx.forEach((idx) => {
          const foundAuction = auctions.value[idx];
          if (
            foundAuction &&
            foundAuction.state === AuctionState.Active &&
            !isNaN(bidAmount) &&
            bidAmount > 0
          ) {
            let bidderName = bidMatch[1];
            if (bidderName === "You") {
              bidderName = currentCharacter.value;
            }

            foundAuction.bids.push({
              player: bidderName,
              bid: bidAmount,
              date: new Date()
            });

            calculateWinningBids(foundAuction);
          }
        });
      } else {
        const cancelBidRegex =
          /^(?<player>.*) (say to your guild|tells the guild), 'CANCEL BID (?<itemid>[0-9]{7}) (?<item>[^:']*'[^:']*|[^:']*)(?:: (?<targetPlayer>.*))?'/i;
        const cancelBidMatch = pipe.data.text.match(cancelBidRegex);
        if (cancelBidMatch && cancelBidMatch.length >= 4) {
          const itemId = cancelBidMatch[3].trim();
          const targetPlayer = cancelBidMatch.groups?.targetPlayer?.trim();

          const foundAuctionIdx = findAllIndexes(
            auctions.value,
            (item: Auction) => item.itemId === itemId
          );

          foundAuctionIdx.forEach((idx) => {
            const foundAuction = auctions.value[idx];
            if (foundAuction && foundAuction.state === AuctionState.Active) {
              let bidderName = cancelBidMatch[1];
              if (bidderName === "You") {
                bidderName = currentCharacter.value;
              }

              // If a target player is specified, use that name; otherwise, use the bidder's name
              const playerToRemove = targetPlayer || bidderName;

              // remove all bids by this player for this auction
              foundAuction.bids = foundAuction.bids.filter(
                (bid) => bid.player !== playerToRemove
              );

              // recalculate winning bids
              calculateWinningBids(foundAuction);
            }
          });
        }
      }
    }
  }
};

zealWindow.zeal.onZealPipes((pipes) => {
  pipes.forEach((pipe) => {
    processPipe(pipe);
  });
});
</script>

<style>
html {
  -webkit-app-region: drag;
  ::-webkit-scrollbar {
    display: none;
  }
}
body {
  padding: 0;
  margin: 0;
  background: rgba(70, 70, 70, 0.4);
  height: 100vh;
}
nav {
  width: 100vw;
  height: 23px;
  display: flex;
  color: #fff;
  justify-content: space-between;
  background-color: #5879d4;
}
.nav-link {
  -webkit-app-region: no-drag;
  padding: 0 7px;
  cursor: pointer;
  font-size: 1.1rem;
}
.nav-link:hover {
  background-color: #fff;
  color: #5879d4;
}
div.title {
  font-size: 0.9rem;
  padding: 0 7px;
}
div.main {
  padding: 5px;
}
div.actions {
  padding: 7px 0;
}
button.action-button {
  margin-right: 10px;
  min-width: 28px;
}
button.icon-button {
  min-height: 28px;
}
button.action-button,
.snack-action {
  -webkit-app-region: no-drag;
  color: #5879d4;
}
div.statusMessage {
  color: #60bc60;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 15px;
}
div.settings {
  margin: 10px;
  padding: 5px;
  background: #eee;
  border: 3px solid #777;
}
span.app-version {
  padding-left: 10px;
}
/* test harness */
div.test-harness {
  background: #fff;
}
.nodrag {
  -webkit-app-region: no-drag;
}
</style>
