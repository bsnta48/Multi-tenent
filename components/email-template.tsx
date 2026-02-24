type EmailTemplateProps = {
    name: string;
    url: string;
}

export function EmailTemplate({ name, url }: EmailTemplateProps) {
    return (
        <div>
            <h1>Welcome, {name}!</h1>
            <p>Click the link below to verify your email address.</p>
            <a href={url}>Verify Email</a>
        </div>
    );
}