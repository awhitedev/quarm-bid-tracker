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
    </div>
    <auctionItem
      v-for="item in auctions"
      :key="index"
      :auction="item"
      @update:statusMessage="showStatusMessage"
    />
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
});

zealWindow.zeal.onSettingsLoaded((settings) => {
  store.commit("updateSettings", settings);
  isTestHarness.value = store.state.appSettings.bidTracker.testHarness;
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
      /^(?<player>.*) (say to your guild|tells the guild), '(OPEN|START BIDS|START|BIDS CLOSED|WINNING BIDS) (?<item>.*)'/i;
    // match[0] - entire string
    // match[1] - name (You or player name)
    // match[2] - not used
    // match[3] - action
    // match[4] - item(s). It can be one item or multiple delimited by a comma if LINK ALL is used in game.

    const startOrEndMatch = pipe.data.text.match(bidStartEndregex);
    if (startOrEndMatch && startOrEndMatch.length === 5) {
      const bidItemsString = startOrEndMatch[4];
      bidItemsString.split(",").forEach((bidItem) => {
        // remove device control characters
        let itemString = bidItem.replace(/dc2/g, "").trim();

        const itemId = itemString.substring(0, 7);
        const itemName = itemString.substring(7).trim();

        const foundAuction = auctions.value.find(
          (item: Auction) => item.itemId === itemId
        );

        if (
          startOrEndMatch[3].toLowerCase() === "start bids" ||
          startOrEndMatch[3].toLowerCase() === "start" ||
          startOrEndMatch[3].toLowerCase() === "open"
        ) {
          // Add item to tracker
          if (foundAuction && foundAuction.state === AuctionState.Active) {
            foundAuction.quantity++;
          } else {
            let newAuction = {
              winningBids: [],
              quantity: 1,
              itemId,
              itemName,
              itemDisplay: `${dc2}${itemId} ${itemName}${dc2}`,
              state: AuctionState.Active,
              timeLeftSeconds:
                store.state.appSettings.bidTracker.defaultTimerSeconds
            };
            auctions.value.push(newAuction);
          }
        } else if (startOrEndMatch[3].toLowerCase() === "bids closed") {
          if (foundAuction) {
            foundAuction.state = AuctionState.Closed;

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
              zealWindow.zeal.sendToDiscord(startOrEndMatch[0]);
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
        /^(?<player>.*) (say to your guild|tells the guild), '(BID)?(?<item>.*) (?<bid>.*)'/i;
      // match[0] - entire string
      // match[1] - name (You or player name)
      // match[2] - not used
      // match[3] - the word 'bid' if provided, otherwise null
      // match[4] - the item with id
      // match[5] - the bid amount
      const bidMatch = pipe.data.text.match(bidRegex);
      console.log(bidMatch);
      if (bidMatch && bidMatch.length >= 5) {
        let itemString = bidMatch[4];
        let bidAmountString = bidMatch[5];

        const bidAmount = parseInt(bidAmountString);
        if (bidAmount > 5000) {
          return;
        }

        const itemId = itemString.trim().substring(0, 7);
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

            // prevent double dipping.. a person can only win 1 item even if there are multiple available
            const existingPlayerBidIdx = foundAuction.winningBids.findIndex(
              (bid) => bid.player === bidderName
            );
            if (existingPlayerBidIdx > -1) {
              // set the bid amount higher if they decide they want to.
              const existingAuction =
                foundAuction.winningBids[existingPlayerBidIdx];
              if (bidAmount > existingAuction.bid) {
                existingAuction.bid = bidAmount;
              }
              return true;
            }

            // sort winning bids.. only overwrite lowest winning bid possible.
            // add to winning bids if quantity being bid out hasn't been reached.
            if (foundAuction.quantity > foundAuction.winningBids.length) {
              foundAuction.winningBids.push({
                player: bidderName,
                bid: bidAmount
              });
              foundAuction.winningBids.sort((a, b) => {
                return a.bid - b.bid;
              });

              if (
                foundAuction.timeLeftSeconds < 10 &&
                foundAuction.timeLeftSeconds > 0
              ) {
                foundAuction.timeLeftSeconds = 20;
              }
            } else {
              // find lowest bid and see if current bid is higher than that. If it is, replace it with current bid.
              const sortedWinners = foundAuction.winningBids.sort((a, b) => {
                return a.bid - b.bid;
              });
              sortedWinners.every((winBid) => {
                if (winBid && bidAmount > winBid.bid) {
                  winBid.bid = bidAmount;
                  winBid.player = bidderName;

                  if (
                    foundAuction.timeLeftSeconds < 10 &&
                    foundAuction.timeLeftSeconds > 0
                  ) {
                    foundAuction.timeLeftSeconds = 20;
                  }

                  return false;
                }
              });
              foundAuction.winningBids.sort((a, b) => {
                return a.bid - b.bid;
              });
            }
          }
        });
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
/* test harness */
div.test-harness {
  background: #fff;
}
.nodrag {
  -webkit-app-region: no-drag;
}
</style>
