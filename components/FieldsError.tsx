import { FieldError } from "./ui/field"

export default function FieldsError({ errors }: { errors: [] }) {
    return errors?.length > 0 && errors.map((error: string) => (
        <FieldError key={error}>
            {error}
        </FieldError>
    ))
}