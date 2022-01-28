import { Fragment, h, useLexicalScope, useStore } from '@builder.io/qwik';
import { ElementFixture, trigger } from '../../testing/element_fixture';
import { expectDOM } from '../../testing/expect-dom.unit';
import { runtimeQrl } from '../import/qrl';
import { qRender } from '../render/q-render.public';
import { onRender, PropsOf, qComponent, withStyles } from './q-component.public';

describe('q-component', () => {
  it('should declare and render basic component', async () => {
    const fixture = new ElementFixture();
    await qRender(fixture.host, <HelloWorld></HelloWorld>);
    expectDOM(
      fixture.host,
      <host>
        <div on:q-render>
          <span>Hello World</span>
        </div>
      </host>
    );
  });

  it('should render Counter and accept events', async () => {
    const fixture = new ElementFixture();
    await qRender(fixture.host, <MyCounter step={5} value={15} />);
    expectDOM(
      fixture.host,
      <host>
        <my-counter>
          <div>
            <button>-</button>
            <span>15</span>
            <button>+</button>
          </div>
        </my-counter>
      </host>
    );
    await trigger(fixture.host, 'button.decrement', 'click');
    expectDOM(
      fixture.host,
      <host>
        <my-counter>
          <div>
            <button>-</button>
            <span>10</span>
            <button>+</button>
          </div>
        </my-counter>
      </host>
    );
  });

  it('should render a collection of todo items', async () => {
    const host = new ElementFixture().host;
    const items = useStore({
      items: [
        useStore({
          done: true,
          title: 'Task 1',
        }),
        useStore({
          done: false,
          title: 'Task 2',
        }),
      ],
    });
    await qRender(host, <Items items={items} />);
    await delay(0);
    expectDOM(
      host,
      <host>
        <items>
          <item-detail>
            <input type="checkbox" checked />
            <span>Task 1</span>
          </item-detail>
          <item-detail>
            <input type="checkbox" />
            <span>Task 2</span>
          </item-detail>
          Total: {'2'}
        </items>
      </host>
    );
  });
});

/////////////////////////////////////////////////////////////////////////////
export const HelloWorld = qComponent(() => {
  withStyles(runtimeQrl(`{}`));
  return onRender(() => {
    return <span>Hello World</span>;
  });
});

/////////////////////////////////////////////////////////////////////////////
// <Greeter salutation="" name=""/>

export const Greeter = qComponent((props: { salutation?: string; name?: string }) => {
  const state = useStore({ count: 0 });
  return onRender(() => (
    <div>
      {' '}
      {props.salutation} {props.name} ({state.count}){' '}
    </div>
  ));
});

//////////////////////////////////////////////
// import { QComponent, qComponent, qView, qHandler, getState, markDirty } from '@builder.io/qwik';

// Component view may need additional handlers describing the component's behavior.
export const MyCounter_update = () => {
  const [props, state, args] =
    useLexicalScope<[PropsOf<typeof MyCounter>, { count: number }, { dir: number }]>();
  state.count += args.dir * (props.step || 1);
};

// Finally tie it all together into a component.
export const MyCounter = qComponent('my-counter', (props: { step?: number; value?: number }) => {
  const state = useStore({ count: props.value || 0 });
  return onRender(() => (
    <div>
      <button
        class="decrement"
        on:click={runtimeQrl(MyCounter_update, [props, state, { dir: -1 }])}
      >
        -
      </button>
      <span>{state.count}</span>
      <button
        class="increment"
        on:click={runtimeQrl(MyCounter_update, [props, state, { dir: -1 }])}
      >
        +
      </button>
    </div>
  ));
});

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

interface ItemObj {
  title: string;
  done: boolean;
}

interface ItemsObj {
  items: ItemObj[];
}

/////////////////////////////////////////////////////////////////////////////

export const ItemDetail = qComponent('item-detail', (props: { itemObj: ItemObj }) => {
  // const state = useStore({ editing: false });
  return onRender(() => (
    <>
      <input type="checkbox" checked={props.itemObj.done} />
      <span>{props.itemObj.title || 'loading...'}</span>
    </>
  ));
});

/////////////////////////////////////////////////////////////////////////////

export const Items = qComponent('items', (props: { items: ItemsObj }) => {
  // const state = useStore({ editing: false });
  return onRender(() => (
    <>
      {props.items.items.map((item) => (
        <ItemDetail itemObj={item} />
      ))}
      Total: {props.items.items.length}
    </>
  ));
});

function delay(miliseconds: number): Promise<void> {
  return new Promise((res) => setTimeout(res, miliseconds));
}