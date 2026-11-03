import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JsonFormatterWorkspace from "../JsonFormatterWorkspace";
import { ToastProvider } from "../../../ui/ToastProvider";
import { toolRegistry } from "../../../../lib/toolRegistry";

const tool = toolRegistry.getBySlug("json-formatter")!;

function setup() {
  render(
    <ToastProvider>
      <JsonFormatterWorkspace tool={tool} />
    </ToastProvider>
  );
  return userEvent.setup();
}

describe("JsonFormatterWorkspace", () => {
  it("disables the actions until there is input", () => {
    setup();
    expect(screen.getByRole("button", { name: "Format JSON" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Minify" })).toBeDisabled();
  });

  it("formats valid JSON and offers copy and download", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Load example" }));
    await user.click(screen.getByRole("button", { name: "Format JSON" }));
    expect(screen.getByText("Valid JSON")).toBeInTheDocument();
    expect((screen.getByLabelText("Result") as HTMLTextAreaElement).value).toContain('\n  "name": "Toolkit4Me"');
    expect(screen.getByRole("button", { name: "Copy" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Download .json" })).toBeEnabled();
  });

  it("shows where invalid JSON breaks", async () => {
    const user = setup();
    await user.type(screen.getByLabelText("Your JSON"), '{{"a": 1,}');
    await user.click(screen.getByRole("button", { name: "Format JSON" }));
    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/Line 1, column \d+/);
    expect(screen.queryByLabelText("Result")).not.toBeInTheDocument();
  });
});
