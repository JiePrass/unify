import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

type SummaryCardProps = {
    title: string
    value: number
}

export default function SummaryCard({
    title,
    value,
}: SummaryCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value}
                </div>
            </CardContent>
        </Card>
    )
}
