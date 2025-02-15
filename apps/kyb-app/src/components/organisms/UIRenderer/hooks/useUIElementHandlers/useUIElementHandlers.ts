import { useEventEmitterLogic } from '@app/components/organisms/DynamicUI/StateManager/components/ActionsHandler';
import { UIElement } from '@app/domains/collection-flow';
import { AnyObject } from '@ballerine/ui';
import { useCallback } from 'react';
import set from 'lodash/set';
import { useStateManagerContext } from '@app/components/organisms/DynamicUI/StateManager/components/StateProvider';

export const useUIElementHandlers = (definition: UIElement<AnyObject>) => {
  const emitEvent = useEventEmitterLogic(definition);
  const { stateApi } = useStateManagerContext();
  const { setContext, getContext } = stateApi;

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<any>) => {
      const context = getContext();

      //@ts-ignore
      set(context, definition.valueDestination || '', event.target.value as any);

      setContext(context);
      emitEvent('onChange');
    },
    [definition, getContext, setContext, emitEvent],
  );

  const onClickHandler = useCallback(() => {
    emitEvent('onClick');
  }, [emitEvent]);

  return {
    onChangeHandler,
    onClickHandler,
  };
};
