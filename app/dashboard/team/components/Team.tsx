export default function Team({ users }: { users: any[] }) {
    return (
        <div className="grid grid-cols-3">
            {users.map((user) => (
                <div key={user.id}>
                    <p>{user.username}</p>
                    <p>{user.email}</p>
                    <p>{user.role}</p>
                </div>
            ))}
        </div>
    )
}