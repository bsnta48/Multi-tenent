import { FieldError } from "./ui/field"

export default function FieldErrors({ errors }: { errors?: string[] }) {
    return errors?.map((error: string) => (
        <FieldError key={error}>
            {error}
        </FieldError>
    ))
}