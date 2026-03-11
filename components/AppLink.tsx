import Link from "next/link"

export default function AppLink({ isAction, href, children }: { isAction: boolean, href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className={`w-full flex-1 py-2 px-4 inline-block rounded-md hover:bg-gray-700 ${isAction ? '!bg-white !text-black ' : ''}`}>
            {children}
        </Link>
    )
}