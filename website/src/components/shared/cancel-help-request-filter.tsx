/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Props = {
    filters: {
        actor: string;
        stage: string;
        minViolationScore: string;
        from: string;
        to: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    onApply: () => void;
    onReset: () => void;
};

export function CancelHelpFilterForm({
    filters,
    setFilters,
    onApply,
    onReset,
}: Props) {
    return (
        <div className="space-y-4">
            {/* Actor */}
            <div className="space-y-2">
                <Label>Aktor</Label>
                <RadioGroup
                    value={filters.actor}
                    onValueChange={(v) =>
                        setFilters((f: any) => ({ ...f, actor: v }))
                    }
                >
                    {["HELPER", "USER", "SYSTEM"].map((v) => (
                        <div key={v} className="flex items-center gap-2">
                            <RadioGroupItem value={v} id={`actor-${v}`} />
                            <Label htmlFor={`actor-${v}`}>{v}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Stage */}
            <div className="space-y-2">
                <Label>Stage</Label>
                <RadioGroup
                    value={filters.stage}
                    onValueChange={(v) =>
                        setFilters((f: any) => ({ ...f, stage: v }))
                    }
                >
                    {["BEFORE_TAKEN", "AFTER_TAKEN"].map((v) => (
                        <div key={v} className="flex items-center gap-2">
                            <RadioGroupItem value={v} id={`stage-${v}`} />
                            <Label htmlFor={`stage-${v}`}>{v}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Violation Score */}
            <div className="space-y-2">
                <Label>Min Violation Score</Label>
                <Input
                    type="number"
                    min={0}
                    value={filters.minViolationScore}
                    onChange={(e) =>
                        setFilters((f: any) => ({
                            ...f,
                            minViolationScore: e.target.value,
                        }))
                    }
                />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
                <Label>From</Label>
                <Input
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                        setFilters((f: any) => ({ ...f, from: e.target.value }))
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>To</Label>
                <Input
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                        setFilters((f: any) => ({ ...f, to: e.target.value }))
                    }
                />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={onReset}>
                    Reset
                </Button>
                <Button size="sm" onClick={onApply}>
                    Apply
                </Button>
            </div>
        </div>
    );
}
