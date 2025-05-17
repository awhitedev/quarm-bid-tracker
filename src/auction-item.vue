<template>
  <div class="auction-item">
    <div
      class="auction-item-frame"
      :style="{ width: percentRemaining + '%' }"
      v-if="auction.state === 0"
    >
      &nbsp;
    </div>
    <div class="auction-text">{{ bidLabel }}</div>
    <div class="auction-timer" v-if="auction.state === 0">
      {{ auction.timeLeftSeconds }}s
      <v-icon icon="mdi-stop" class="stop" @click="stopBids" />
    </div>
    <div class="auction-timer" v-if="auction.state === 1">
      BIDS CLOSED {{ auction.finalCountdown }}
      <v-icon
        icon="mdi-trophy"
        class="trophy"
        @click="declareWinner"
        v-if="auction.winningBids.length > 0"
      />
    </div>
    <div class="auction-timer" v-if="auction.state === 2">
      WINNER ANNOUNCED {{ auction.finalCountdown }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { zealWindow } from "./zeal-window";
import { AuctionState } from "./auction";

const store = useStore();
let intervalId = ref(null);

const percentRemaining = computed(() => {
  if (!props.auction) {
    return 0;
  }
  return Math.round(
    (props.auction.timeLeftSeconds /
      store.state.appSettings.bidTracker.defaultTimerSeconds) *
      100
  );
});

const bidLabel = computed(() => {
  if (!props.auction) {
    return "Error";
  }

  let bidString = `(${props.auction.quantity}x) ${props.auction.itemName} - `;
  if (props.auction.winningBids.length == 0) {
    bidString += "No bids";
  } else if (props.auction.winningBids.length > 2) {
    bidString += "Many Bids";
  } else {
    for (let i = 0; i < props.auction.winningBids.length; i++) {
      const bid = props.auction.winningBids[i];
      bidString += `${bid.player} ${bid.bid}`;
      if (i + 1 < props.auction.winningBids.length) {
        bidString += ", ";
      }
    }
  }
  return bidString;
});

const stopBids = async () => {
  zealWindow.zeal.copyText(`BIDS CLOSED ${props.auction.itemDisplay}`);
  emit(
    "update:statusMessage",
    "Bids closed message copied to clipboard. Paste this message in guild chat!"
  );
};

const declareWinner = async () => {
  let winningBidText = "";
  for (let i = 0; i < props.auction.winningBids.length; i++) {
    const winningBid = props.auction.winningBids[i];
    if (!winningBid) {
      continue;
    }
    winningBidText += `${winningBid.player} ${winningBid.bid}`;

    if (i + 1 < props.auction.winningBids.length) {
      winningBidText += " | ";
    }
  }

  zealWindow.zeal.copyText(
    `WINNING BIDS ${props.auction.itemDisplay} ::: ${winningBidText}`
  );

  emit(
    "update:statusMessage",
    "Bid winners message copied to clipboard. Paste this message in guild chat!"
  );
};

const props = defineProps({
  auction: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["update:statusMessage"]);

onMounted(() => {
  intervalId.value = setInterval(() => {
    if (props.auction.state !== AuctionState.Active) {
      clearInterval(intervalId.value);
      return;
    }

    props.auction.timeLeftSeconds = props.auction.timeLeftSeconds - 1;
    if (props.auction.timeLeftSeconds <= 0) {
      clearInterval(intervalId.value);
    }
  }, 1000);
});
</script>

<style>
div.auction-item {
  position: relative;
  background-color: #b9b9b9;
  color: #fff;
  font-weight: bold;
  width: 100%;
  height: 25px;
  margin: 5px 0;
  line-height: 25px;
  font-size: 0.75rem;
}
div.auction-item-frame {
  background-color: #60bc60;
}
div.auction-text {
  position: absolute;
  top: 0;
  padding-left: 5px;
}
div.auction-timer {
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 5px;
}
i.stop {
  color: #c24646;
  -webkit-app-region: no-drag;
  font-size: 1.5rem;
  cursor: pointer;
}
i.trophy {
  color: rgb(255, 230, 0);
  font-size: 1.4rem;
  -webkit-app-region: no-drag;
}
div.no-winner {
  background-color: #c24646;
}
</style>
