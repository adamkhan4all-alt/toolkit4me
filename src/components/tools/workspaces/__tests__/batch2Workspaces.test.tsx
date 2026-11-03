import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";
import WordCounterWorkspace from "../WordCounterWorkspace";
import TextCompareWorkspace from "../TextCompareWorkspace";
import Base64Workspace from "../Base64Workspace";
import { ToastProvider } from "../../../ui/ToastProvider";
import { toolRegistry } from "../../../../lib/toolRegistry";
import type { ToolDefinition } from "../../../../types/tool";

function setup(Workspace: ComponentType<{ tool: ToolDefinition }>, slug: string) {
  render(
    <ToastProvider>
      <Workspace tool={toolRegistry.getBySlug(slug)!} />
    </ToastProvider>
  );
  return userEvent.setup();
}

function tile(label: string) {
  return within(screen.getByText(label, { selector: "dt" }).parentElement!).getByRole("definition").textContent;
}

describe("WordCounterWorkspace", () => {
  it("updates counts live as you type", async () => {
    const user = setup(WordCounterWorkspace, "word-counter");
    expect(tile("Words")).toBe("0");
    await user.type(screen.getByLabelText("Your text"), "Hello there. General Kenobi!");
    expect(await screen.findByText("4", { selector: "dd" })).toBeInTheDocument();
    expect(tile("Sentences")).toBe("2");
    expect(tile("Characters")).toBe("28");
    expect(screen.getByRole("button", { name: "Copy counts" })).toBeEnabled();
  });
});

describe("TextCompareWorkspace", () => {
  it("highlights added and removed lines", async () => {
    const user = setup(TextCompareWorkspace, "text-compare");
    await user.type(screen.getByLabelText("Original text"), "one{Enter}two{Enter}three");
    await user.type(screen.getByLabelText("Changed text"), "one{Enter}2{Enter}three{Enter}four");
    await user.click(screen.getByRole("button", { name: "Compare text" }));
    expect(await screen.findByText(/\+2 lines added/)).toBeInTheDocument();
    expect(screen.getByText(/−1 line removed/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download .diff" })).toBeEnabled();
  });

  it("reports identical texts", async () => {
    const user = setup(TextCompareWorkspace, "text-compare");
    await user.type(screen.getByLabelText("Original text"), "Same");
    await user.type(screen.getByLabelText("Changed text"), "same");
    await user.click(screen.getByLabelText("Ignore upper/lower case"));
    await user.click(screen.getByRole("button", { name: "Compare text" }));
    expect(await screen.findByText(/No differences found with the selected options/)).toBeInTheDocument();
  });
});

describe("Base64Workspace", () => {
  it("encodes UTF-8 text and decodes it back", async () => {
    const user = setup(Base64Workspace, "base64-encoder-decoder");
    await user.type(screen.getByLabelText("Text or Base64"), "héllo ✓");
    await user.click(screen.getByRole("button", { name: "Encode" }));
    const encoded = (screen.getByLabelText("Base64") as HTMLTextAreaElement).value;
    expect(encoded).toBe(Buffer.from("héllo ✓").toString("base64"));

    await user.clear(screen.getByLabelText("Text or Base64"));
    await user.type(screen.getByLabelText("Text or Base64"), encoded);
    await user.click(screen.getByRole("button", { name: "Decode" }));
    expect((screen.getByLabelText("Decoded text") as HTMLTextAreaElement).value).toBe("héllo ✓");
  });

  it("explains invalid Base64", async () => {
    const user = setup(Base64Workspace, "base64-encoder-decoder");
    await user.type(screen.getByLabelText("Text or Base64"), "abc$");
    await user.click(screen.getByRole("button", { name: "Decode" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/isn't a Base64 character/);
  });
});
