import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { StatusBadge, lifecycleTone, healthTone, ecnStateTone } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { IconButton } from "@/components/ui/icon-button";

describe("Shared UI Primitives (Phase 2)", () => {
  describe("AppIcon", () => {
    it("renders decorative icons with aria-hidden=true", () => {
      const { container } = render(<AppIcon name="search" size="sm" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeDefined();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });

    it("renders standalone icons with accessible aria-label", () => {
      render(<AppIcon name="settings" aria-label="Settings configuration" />);
      const icon = screen.getByRole("img", { name: "Settings configuration" });
      expect(icon).toBeDefined();
    });
  });

  describe("StatusBadge", () => {
    it("renders six core semantic tones", () => {
      render(
        <div>
          <StatusBadge tone="critical">Critical Issue</StatusBadge>
          <StatusBadge tone="warning">Review Required</StatusBadge>
          <StatusBadge tone="success">Released</StatusBadge>
          <StatusBadge tone="info">In Work</StatusBadge>
          <StatusBadge tone="pending">Pending</StatusBadge>
          <StatusBadge tone="neutral">Draft</StatusBadge>
        </div>
      );
      expect(screen.getByText("Critical Issue")).toBeDefined();
      expect(screen.getByText("Released")).toBeDefined();
    });

    it("correctly maps domain vocabularies to semantic tones", () => {
      expect(lifecycleTone("Released")).toBe("success");
      expect(lifecycleTone("In Review")).toBe("warning");
      expect(healthTone("healthy")).toBe("success");
      expect(healthTone("critical")).toBe("critical");
      expect(ecnStateTone("Approved")).toBe("success");
      expect(ecnStateTone("Draft")).toBe("neutral");
    });
  });

  describe("PageHeader", () => {
    it("renders title, optional eyebrow, and description", () => {
      render(
        <PageHeader
          title="Engineering BOM"
          eyebrow="ENGINEERING"
          subtitle="Hierarchical structure and components"
        >
          <div data-testid="child-content">Child Content</div>
        </PageHeader>
      );
      expect(screen.getByText("Engineering BOM")).toBeDefined();
      expect(screen.getByText("ENGINEERING")).toBeDefined();
      expect(screen.getByText("Hierarchical structure and components")).toBeDefined();
      expect(screen.getByTestId("child-content")).toBeDefined();
    });
  });

  describe("IconButton", () => {
    it("renders with mandatory accessible label", () => {
      render(<IconButton icon="refresh" label="Sync data now" />);
      const button = screen.getByRole("button", { name: "Sync data now" });
      expect(button).toBeDefined();
      expect(button.getAttribute("title")).toBe("Sync data now");
    });
  });
});

