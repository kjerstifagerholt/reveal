import { BaseCommand } from "@/Core/Commands/BaseCommand";

// Visualizer component state interface
export interface VisualizerStateInterface {
    toolbars: { [key: string]: ToolbarCommand[] },
    targets: { [key: string]: any }
}

// Toolbar command interface
export interface ToolbarCommand {
    isChecked: boolean;
    icon: string;
    command: BaseCommand;
}

