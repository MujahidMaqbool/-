export class FavouriteViewModel {
    schedulerFavouriteViewID:number;
    schedulerFavouriteViewName: string;
    schedulerFavouriteViewDetail: FavouriteViewDetail[] = [];
}
export class FavouriteViewDetail {
    schedulerFavouriteViewDetailID:number;
    schedulerFavouriteViewID: number;
    schedulerFavouriteViewTypeID:number;
    viewItemID:number;
}