import { ItemView, WorkspaceLeaf } from "obsidian";

// @ts-ignore
import Timer from "./view/Timer.svelte";

export const VIEW_TYPE_TIMER = "toggl-timer-view";

export class TimerView extends ItemView {
  view: Timer;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getIcon(): string {
    return "clock";
}

  getViewType() {
    return VIEW_TYPE_TIMER;
  }

  getDisplayText() {
    return "Toggl Timer";
  }

  async onOpen() {
    this.view = new Timer({target: this.contentEl});
  }

  async onClose() {
    this.view.$destroy();
  }
}