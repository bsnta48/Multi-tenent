type EmailTemplateProps = {
    name: string;
    url: string;
    verifyCode: string;
}

export function EmailTemplate({ name, url, verifyCode }: EmailTemplateProps) {
    return (
        <div>
            <h1>Welcome, {name}!</h1>
            <p>Click the link below to verify your email address.</p>
            <p>Your verification code is: {verifyCode}</p>
            <a href={url}>Verify Email</a>
        </div>
    );
}