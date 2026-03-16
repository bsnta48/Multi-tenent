type EmailTemplateProps = {
    name: string;
    url: string;
}

export function VerifyEmailTemplate({ name, url }: EmailTemplateProps) {
    return (
        <div>
            <h1>Welcome, {name}!</h1>
            <p>Click the link below to verify your email address.</p>
            <a href={url}>Verify Email</a>
        </div>
    );
}

export function ForgotPasswordTemplate({ name, url }: EmailTemplateProps) {
    return (
        <div>
            <h1>Forgot Password</h1>
            <p>Click the link below to reset your password.</p>
            <a href={url}>Reset Password</a>
        </div>
    )
}

export function InviteLinkTemplate({ name, url }: EmailTemplateProps) {
    return (
        <div>
            <h1>Invite Link</h1>
            <p>Click the link below to accept the invite.</p>
            <a href={url}>Accept Invite</a>
        </div>
    )
}