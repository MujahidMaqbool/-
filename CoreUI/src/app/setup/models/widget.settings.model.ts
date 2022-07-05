export class WidgetUrl {
    HomeUrl: string;
    ClassUrl: string;
    ServiceUrl: string;
    ProductUrl: string;
    MembershipUrl: string;
    QRCodeUrl: string
}

export class Permission {
    ShowClassOnline: boolean;
    ShowServiceOnline: boolean;
    ShowProductOnline: boolean;
    ShowMembershipOnline: boolean;
    ShowMembershipForMembersOnline: boolean;
    ShowHomeOnline: boolean;
    defaultLandingPage : number;
}

export class SocialMedia {
    FacebookUrl: string;
    TwitterUrl: string;
    InstagramUrl: string;
    YoutubeUrl: string;
    LinkedInUrl: string;
}

export class Banner {
    HomeBanner: string = "";
    MembershipBanner: string = "";
    ClassBanner: string = "";
    ServiceBanner: string = "";
    ProductBanner: string = "";
    CheckoutBanner: string = "";
    PromotionalBanner: string = "";
}

export class WidgetSetting {
    BranchID: number;
    Permission: Permission;
    SocialMedia: SocialMedia;
    Banner: Banner;
}

export class WidgetSettingWithBranch {
    WidgetSetting: WidgetSetting;
    BranchID: number;
    BranchName: string;
}

export class UploadBanner {
    ImageFile: string = "";
    BannerTypeID: number;
}


export class Branch {
    BranchID: number;
    BranchName: string;
}