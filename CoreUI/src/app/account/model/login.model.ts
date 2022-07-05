export class Login {
    public Email: string;
    public CompanyID?: number;    
    public Password?: string;
    public AppSourceTypeID: number;
}

export class SavePassword {
    public PasswordToken: string;
    public Email: string;
    public Password: string;
}

export class ChangePassword {
    public OldPassword: string;
    public Password: string;
}