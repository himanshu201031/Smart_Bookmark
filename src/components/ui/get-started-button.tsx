import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface GetStartedButtonProps {
    onClick?: () => void;
}

export function GetStartedButton({ onClick }: GetStartedButtonProps) {
    return (
        <Button
            onClick={onClick}
            className="group relative overflow-hidden bg-black hover:bg-gray-900 text-white border-0"
            size="lg"
        >
            <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
                Get Started
            </span>
            <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/20 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" className="text-white" />
            </i>
        </Button>
    );
}
