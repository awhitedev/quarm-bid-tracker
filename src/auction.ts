export interface Auction {
  winningBids?: WinningBid[];
  itemId: string;
  itemName: string;
  itemDisplay: string;
  timeLeftSeconds: number;
  quantity: number;
  state: AuctionState;
  finalCountdown?: number;
}

export enum AuctionState {
  Active,
  Closed,
  WinnerAnnounced
}

export interface WinningBid {
  bid: number;
  player: string;
}
