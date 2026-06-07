import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastNotification';

function Trigger({ message, type }) {
  const { addToast } = useToast();
  return <button onClick={() => addToast(message, type)}>fire</button>;
}

describe('ToastNotification', () => {
  it('shows a toast with the given message when addToast is called', async () => {
    render(
      <ToastProvider>
        <Trigger message="Snake detected at Zone A" type="danger" />
      </ToastProvider>
    );

    expect(screen.queryByText('Snake detected at Zone A')).not.toBeInTheDocument();

    await act(async () => {
      screen.getByRole('button', { name: 'fire' }).click();
    });

    expect(screen.getByText('Snake detected at Zone A')).toBeInTheDocument();
    // danger toasts are labelled as a hazard alert
    expect(screen.getByText('HAZARD ALERT')).toBeInTheDocument();
  });
});
