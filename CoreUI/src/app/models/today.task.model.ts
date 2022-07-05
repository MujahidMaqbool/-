export class TodayTaskSearch{
    public StaffName: string = "";
    public ActvitiyTypeID: number = null;
    public DateFrom: string;
    public DateTo: string; 
    public PageNumber: number;
    public PageSize: number;
}
export class TodayActivities{
    public Title: string;
    public StaffName: string;
    public CustomerName: string;
    public ActivityTypeName: string;
    public FollowUpDate: Date;
    public StartTime: string;
    public EndTime: string;
    public Note: string;
}