import React, { useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const castArray = (...args: any) => (args[0] instanceof Array ? args[0] : args);

type UseWizard = {
  cancelledPath: string;
  completedPath: string;
  initialStepIndex: number;
  maxStepReached: number;
  onCancel: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  onComplete: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  path: string;
  stepCount: number;
  stepIndex: number;
};

type UseWizardMatchParams = {
  stepIndex?: string;
};

type UseWizardProps = {
  children?: React.ReactNode;
  basename?: string;
  cancelledPath: string;
  completedPath: string;
  initialStepIndex?: number;
  onCancel?: () => void;
  onComplete?: () => void;
  path: string;
};

type GoToStepProps = React.HTMLAttributes<Element> & {
  stepIndex: number;
};

type WizardType = React.FunctionComponent<Partial<UseWizardProps>> & {
  Cancel: React.FC<Omit<React.HTMLAttributes<Element>, "to" | "onClick">>;
  Complete: React.FC<Omit<React.HTMLAttributes<Element>, "to" | "onClick">>;
  GoToStep: React.FC<GoToStepProps>;
  NextStep: React.FC<React.HTMLAttributes<Element>>;
  PreviousStep: React.FC<React.HTMLAttributes<Element>>;
  Restart: React.FC<React.HTMLAttributes<Element>>;
  Step: React.FC;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const WizardContext = React.createContext<UseWizard>(undefined!);
export const useWizard = ({
  children,
  cancelledPath,
  completedPath,
  initialStepIndex = 0,
  onCancel = () => undefined,
  onComplete = () => undefined,
  path,
}: UseWizardProps): UseWizard => {
  const stepCount = (children && castArray(children).length) || 0;
  const [maxStepReached, setMaxStepReached] = useState(initialStepIndex);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<UseWizardMatchParams>();
  const stepIndex = isFirstRender
    ? initialStepIndex
    : parseInt(params.stepIndex || "0", 10) || 0;

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isFirstRender) {
      navigate(`${path}${initialStepIndex}/`);
      setIsFirstRender(false);
    } else {
      setMaxStepReached(Math.max(stepIndex, maxStepReached));
    }
  }, [
    cancelledPath,
    completedPath,
    location.pathname,
    navigate,
    initialStepIndex,
    isFirstRender,
    maxStepReached,
    onCancel,
    onComplete,
    path,
    stepIndex,
  ]);

  return {
    cancelledPath,
    completedPath,
    initialStepIndex,
    maxStepReached,
    onCancel,
    onComplete,
    path,
    stepCount,
    stepIndex,
  };
};

const WizardContainer: React.FunctionComponent<UseWizardProps> = (props) => {
  const { children } = props;
  const wizard = useWizard(props);
  const location = useLocation();

  if (
    location.pathname === wizard.completedPath ||
    location.pathname === wizard.cancelledPath
  )
    return null;

  return (
    <WizardContext.Provider value={wizard}>
      {castArray(children)[wizard.stepIndex]}
    </WizardContext.Provider>
  );
};

export const Wizard: WizardType = (props) => {
  const useWizardProps = {
    cancelledPath: "/",
    completedPath: "/completed/",
    path: "/",
    ...props,
  };
  return (
    <Routes>
      <Route path={props.path}>
        <Route index element={<WizardContainer {...useWizardProps} />} />
        <Route
          path=":stepIndex"
          element={<WizardContainer {...useWizardProps} />}
        />
      </Route>
    </Routes>
  );
};

export const RoutedWizard: WizardType = (props) => {
  return (
    <BrowserRouter basename={props.basename}>
      <Wizard {...props} />
    </BrowserRouter>
  );
};

const Step: React.FunctionComponent = ({ children }) => {
  return <>{children}</>;
};
Wizard.Step = Step;
RoutedWizard.Step = Step;

const GoToStep: React.FunctionComponent<GoToStepProps> = ({
  stepIndex,
  ...props
}) => {
  const wizard = React.useContext(WizardContext);
  return <Link {...props} to={`${wizard.path}${stepIndex}/`} />;
};
Wizard.GoToStep = GoToStep;
RoutedWizard.GoToStep = GoToStep;

const PreviousStep: React.FunctionComponent = (props) => {
  const wizard = React.useContext(WizardContext);
  const previousStepIndex = Math.max(wizard.stepIndex - 1, 0);
  return <GoToStep {...props} stepIndex={previousStepIndex} />;
};
Wizard.PreviousStep = PreviousStep;
RoutedWizard.PreviousStep = PreviousStep;

const NextStep: React.FunctionComponent = (props) => {
  const wizard = React.useContext(WizardContext);
  const nextStepIndex = Math.min(wizard.stepIndex + 1, wizard.stepCount - 1);
  return <GoToStep {...props} stepIndex={nextStepIndex} />;
};
Wizard.NextStep = NextStep;
RoutedWizard.NextStep = NextStep;

const Restart: React.FunctionComponent = (props) => {
  const wizard = React.useContext(WizardContext);
  return <GoToStep {...props} stepIndex={wizard.initialStepIndex} />;
};
Wizard.Restart = Restart;
RoutedWizard.Restart = Restart;

const Cancel: React.FunctionComponent = (props) => {
  const wizard = React.useContext(WizardContext);
  return (
    <Link
      {...props}
      to={wizard.cancelledPath}
      onClick={(e) => {
        window.scrollTo(0, 0);
        wizard.onCancel(e);
      }}
    />
  );
};
Wizard.Cancel = Cancel;
RoutedWizard.Cancel = Cancel;

const Complete: React.FunctionComponent = (props) => {
  const wizard = React.useContext(WizardContext);
  return (
    <Link
      {...props}
      to={wizard.completedPath}
      onClick={(e) => {
        window.scrollTo(0, 0);
        wizard.onComplete(e);
      }}
    />
  );
};
Wizard.Complete = Complete;
RoutedWizard.Complete = Complete;

export default Wizard;
