export class ActivityTabsOptions {
    public ownerId: number;
    public module: number;
    public apiUrls: ActivityApiUrls;
    public email?: string;
    public activeTabs: string[];
    public defaultActiveTab: string;
    public activityRefrences: any;
    public permissions: ActivitiesPermissions = new ActivitiesPermissions();    
    public isMarkAsDone: boolean;
    public isEditMode: boolean;
    public isReadOnlyActivities?: boolean;
    public modelData?: any;
}

export class ActivitiesPermissions {
    public isSaveActivityAllowed: boolean;
    public isProceedToMemberAllowed: boolean;
    public isSaveSMSAllowed: boolean;
    public isSaveEmailAllowed: boolean;
}

export class ActivityApiUrls {
    /* Get APIs */
    public getAll: string;
    public getAppointmentFundamentals: string;
    public getAppointmentNowById: string;
    public getAppointmentLaterById: string;
    public getCallFundamentals: string;
    public getCallNowById: string;
    public getCallLaterById: string;
    public getEmailById: string;
    public getLeadDetail: string;
    public getNoteById: string;
    public getSMSById: string;
    public getAppNotificationById: string;
    public getTaskById: string;
    public getAchievementById: string;
    public getTaskFundamentals: string;
    public getTemplateFundamentals: string;
    public getTemplateDescription: string;
    public getViewTaskById: string;
    public getActivityCount: string;
       
    /* Save APIs*/
    public saveAppointmentNow: string;
    public saveAppointmentMarkAsDone: string;    
    public saveAppointmentLater: string;
    public saveCallNow: string;
    public saveCallMarkAsDone: string;
    public saveCallLater: string;
    public saveEmail: string;
    public saveStatus: string;
    public saveNote: string;
    public saveTask: string;
    public saveSMS: string;
    public saveAppNotification: string;
    public saveAchievement: string;

    /* Delete API */
    public delete: string;
}