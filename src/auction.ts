export interface Auction {
  bids?: Bid[];
  winningBids?: Bid[];
  itemId: string;
  itemName: string;
  itemDisplay: string;
  timeLeftSeconds: number;
  quantity: number;
  state: AuctionState;
  dateCreated: number;
  finalCountdown?: number;
}

export enum AuctionState {
  Active,
  Closed,
  WinnerAnnounced
}

export interface Bid {
  bid: number;
  player: string;
  date: Date;
}
