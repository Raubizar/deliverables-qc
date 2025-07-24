import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  chart?: React.ReactNode;
  tooltip: string;
}

export const MetricCard = ({ title, value, chart, tooltip }: MetricCardProps) => {
  return (
    <TooltipProvider>
      <div className="bg-card rounded-xl p-4 apple-shadow-sm apple-transition apple-hover">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground apple-transition" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold text-foreground">{value}</div>
          {chart && <div className="ml-2">{chart}</div>}
        </div>
      </div>
    </TooltipProvider>
  );
};