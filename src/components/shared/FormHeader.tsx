import { CardDescription, CardHeader, CardTitle } from "../ui/card"

interface FormHeaderProps {
  title: string
  description: string
}

export default function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  )
}