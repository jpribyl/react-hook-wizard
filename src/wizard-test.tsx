import { fireEvent, render, screen } from '@testing-library/react';
import Wizard from './wizard';
import React, { ComponentProps, useState } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

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
    <Router>
      <Switch>
        <Wizard
          path="/"
          cancelledPath="/"
          completedPath="/"
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
      </Switch>
    </Router>
  );
};

const setup = props => {
  window.history.pushState({}, '', '/');
  return render(<TestWizard {...props} />);
};

test('does not initially render the wizard', () => {
  setup({});
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.queryByText('step 1')).not.toBeInTheDocument();
});

test('renders initial step correctly', () => {
  const initialStepIndex = 1;
  setup({ initialStepIndex });
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('step 2')).toBeInTheDocument();
});

test('navigates to previous step after clicking previous step button', () => {
  const initialStepIndex = 1;
  setup({ initialStepIndex });
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByText('Back'));
  expect(screen.getByText('step 1')).toBeInTheDocument();
});

test('navigates to next step after clicking next step button', () => {
  setup({});
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByText('Continue'));
  expect(screen.getByText('step 2')).toBeInTheDocument();
});

test('resets to initial step when restart is clicked', () => {
  const initialStepIndex = 1;
  setup({ initialStepIndex });
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByText('Continue'));
  expect(screen.getByText('step 3')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Restart'));
  expect(screen.getByText('step 2')).toBeInTheDocument();
});

test('completes wizard when complete is clicked', () => {
  const completedPath = '/completed/';
  const onComplete = jest.fn();
  const initialStepIndex = 2;
  setup({ completedPath, initialStepIndex, onComplete });
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByText('Complete'));
  expect(window.location.pathname).toBe('/completed/');
  expect(onComplete).toHaveBeenCalled();
});

test('cancels wizard when cancel is clicked', () => {
  const cancelledPath = '/cancelled/';
  const onCancel = jest.fn();
  setup({ cancelledPath, onCancel });
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByText('Cancel'));
  expect(window.location.pathname).toBe('/cancelled/');
  expect(onCancel).toHaveBeenCalled();
});

test('goes to step when GoToStep is clicked', () => {
  setup({});
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByText('Go to step 3'));
  expect(screen.getByText('step 3')).toBeInTheDocument();
});
