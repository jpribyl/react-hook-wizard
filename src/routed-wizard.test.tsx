import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { ComponentProps, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { RoutedWizard as Wizard } from "./wizard";

const TestWizard: React.FunctionComponent<
  Partial<ComponentProps<typeof Wizard>>
> = (props) => {
  const [isShowingWizard, setIsShowingWizard] = useState(false);

  if (!isShowingWizard) {
    return (
      <button type="button" onClick={() => setIsShowingWizard(true)}>
        show wizard
      </button>
    );
  }

  return (
    <Wizard
      initialStepIndex={0}
      onCancel={() => setIsShowingWizard(false)}
      onComplete={() => setIsShowingWizard(false)}
      {...props}
    >
      <Wizard.Step>
        <h1>step 1</h1>
        <Wizard.NextStep>Continue</Wizard.NextStep>
        <Wizard.Cancel>Cancel</Wizard.Cancel>
        <Wizard.GoToStep stepIndex={2}>Go to step 3</Wizard.GoToStep>
      </Wizard.Step>
      <Wizard.Step>
        <h1>step 2</h1>
        <Wizard.PreviousStep>Back</Wizard.PreviousStep>
        <Wizard.NextStep>Continue</Wizard.NextStep>
      </Wizard.Step>
      <Wizard.Step>
        <h1>step 3</h1>
        <Wizard.Restart>Restart</Wizard.Restart>
        <Wizard.Complete>Complete</Wizard.Complete>
      </Wizard.Step>
    </Wizard>
  );
};

const setup = (props: Partial<ComponentProps<typeof Wizard>>) => {
  window.scrollTo = jest.fn();
  window.history.pushState({}, "", "/");
  return render(<TestWizard {...props} />);
};

test("does not initially render the wizard", () => {
  setup({});
  expect(screen.getByRole("button")).toBeInTheDocument();
  expect(screen.queryByText("step 1")).not.toBeInTheDocument();
});

test("renders initial step correctly", async () => {
  const initialStepIndex = 1;
  setup({ initialStepIndex });
  userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByText("step 2")).toBeInTheDocument());
});

test("navigates to previous step after clicking previous step button", async () => {
  const initialStepIndex = 1;
  setup({ initialStepIndex });
  userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByText("Back")).toBeInTheDocument());
  userEvent.click(screen.getByText("Back"));
  await waitFor(() => expect(screen.getByText("step 1")).toBeInTheDocument());
});

test("navigates to next step after clicking next step button", async () => {
  setup({});
  userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByText("Continue")).toBeInTheDocument());
  userEvent.click(screen.getByText("Continue"));
  await waitFor(() => expect(screen.getByText("step 2")).toBeInTheDocument());
});

test("resets to initial step when restart is clicked", async () => {
  const initialStepIndex = 1;
  setup({ initialStepIndex });
  userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByText("Continue")).toBeInTheDocument());
  userEvent.click(screen.getByText("Continue"));
  await waitFor(() => expect(screen.getByText("step 3")).toBeInTheDocument());
  userEvent.click(screen.getByText("Restart"));
  await waitFor(() => expect(screen.getByText("step 2")).toBeInTheDocument());
});

test("completes wizard when complete is clicked", async () => {
  const completedPath = "/completed/";
  const onComplete = jest.fn();
  const initialStepIndex = 2;
  setup({ completedPath, initialStepIndex, onComplete });
  userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByText("Complete")).toBeInTheDocument());
  userEvent.click(screen.getByText("Complete"));
  await waitFor(() => expect(window.location.pathname).toBe("/completed/"));
  expect(onComplete).toHaveBeenCalled();
});

test("cancels wizard when cancel is clicked", async () => {
  const cancelledPath = "/cancelled/";
  const onCancel = jest.fn();
  setup({ cancelledPath, onCancel });
  userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByText("Cancel")).toBeInTheDocument());
  userEvent.click(screen.getByText("Cancel"));
  await waitFor(() => expect(window.location.pathname).toBe("/cancelled/"));
  expect(onCancel).toHaveBeenCalled();
});

test("goes to step when GoToStep is clicked", async () => {
  setup({});
  userEvent.click(screen.getByRole("button"));
  await waitFor(() =>
    expect(screen.getByText("Go to step 3")).toBeInTheDocument()
  );
  userEvent.click(screen.getByText("Go to step 3"));
  await waitFor(() => expect(screen.getByText("step 3")).toBeInTheDocument());
});
