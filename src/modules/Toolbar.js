import { BaseModule } from './BaseModule';

const Parchment = window.Quill.imports.parchment;
const FloatStyle = new Parchment.Attributor.Style('float', 'float');
const MarginStyle = new Parchment.Attributor.Style('margin', 'margin');
const DisplayStyle = new Parchment.Attributor.Style('display', 'display');
const WidthStyle = new Parchment.Attributor.Style('width', 'width');
const SystemTagClass = new Parchment.Attributor.Class('systemtag', 'systemtag');

export class Toolbar extends BaseModule {
  onCreate = () => {
  // Setup Toolbar
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'ql-image-toolbar btn-group';
    // Object.assign(this.toolbar.style, this.options.toolbarStyles);
    this.overlay.appendChild(this.toolbar);
    // Setup Buttons
    this._defineButtons();
    this._addToolbarActions();
  };

  // The toolbar and its children will be destroyed when the overlay is removed
  onDestroy = () => {};

  // Nothing to update on drag because we are are positioned relative to the overlay
  onUpdate = () => {};

  _defineButtons = () => {
    this.actions = [
      {
        type: 'button',
        icon: 'ql-float-left',
        apply: () => {
          DisplayStyle.remove(this.img);
          FloatStyle.add(this.img, 'left');
          MarginStyle.add(this.img, '0 1em 1em 0');
          WidthStyle.remove(this.img);
        },
        isApplied: () => FloatStyle.value(this.img) == 'left',
      },
      {
        type: 'button',
        icon: 'ql-float-center',
        apply: () => {
          DisplayStyle.add(this.img, 'block');
          FloatStyle.remove(this.img);
          MarginStyle.add(this.img, 'auto');
          WidthStyle.remove(this.img);
        },
        isApplied: () => MarginStyle.value(this.img) == 'auto',
      },
      {
        type: 'button',
        icon: 'ql-float-right',
        apply: () => {
          DisplayStyle.remove(this.img);
          FloatStyle.add(this.img, 'right');
          MarginStyle.add(this.img, '0 0 1em 1em');
          WidthStyle.remove(this.img);
        },
        isApplied: () => FloatStyle.value(this.img) == 'right',
      },
      {
        type: 'button',
        icon: 'ql-full-width',
        apply: () => {
          DisplayStyle.add(this.img, 'block');
          FloatStyle.remove(this.img);
          MarginStyle.remove(this.img);
          WidthStyle.add(this.img, '100%');
        },
        isApplied: () => WidthStyle.value(this.img) == '100%',
      },
      {
        type: 'dropdown',
        options: this.options.systemTags,
      },
      {
        type: 'button',
        action: 'remove',
        icon: 'icon wb-trash',
        apply: () => {
          this.img.parentNode.removeChild(this.img);
        },
        isApplied: () => {},
      },
    ];
  };

  _dropdown(action, idx) {
    const options = [{id: '', name: 'System tag', css: ''}].concat(action.options);
    const dropdown = document.createElement('div');
    dropdown.className = 'btn-group';
    dropdown.setAttribute('role', 'group');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline btn-default dropdown-toggle';
    button.id = `ql-img-toolbar-button-${idx}`;
    button.setAttribute('data-toggle', 'dropdown');
    button.setAttribute('aria-expanded', 'false');

    const span = document.createElement('span');
    span.className = 'text-truncate';
    const selected = options.filter(option => option.css === SystemTagClass.value(this.img));
    span.textContent = selected ? selected[0].name : options[0].name;
    button.appendChild(span);

    const caret = document.createElement('span');
    caret.className = 'caret';
    button.appendChild(caret);

    dropdown.appendChild(button);

    const ul = document.createElement('ul');
    ul.className = 'dropdown-menu';
    ul.setAttribute('aria-labelledby', button.id);
    ul.setAttribute('role', 'menu');
    options.forEach((option) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');
      const a = document.createElement('a');
      a.textContent = option.name;
      a.setAttribute('role', 'menuitem');
      a.addEventListener('click', () => {
        if (option.css) {
          SystemTagClass.add(this.img, option.css.slice(1));
          span.textContent = option.name;
        } else {
          SystemTagClass.remove(this.img);
          span.textContent = options[0].name;
        }
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    dropdown.appendChild(ul);
    return dropdown;
  }

  _button(action, idx) {
    const button = document.createElement('button');
    button.id = `ql-img-toolbar-button-${idx}`;
    button.type = 'button';
    button.className = 'btn btn-default';
    // Object.assign(button, this.options.toolbarButtonStyles);
    const icon = document.createElement('i');
    icon.className = action.icon;
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);
    button.addEventListener('click', (ev) => {
      // deselect all buttons
      this.toolbar.querySelectorAll('button').forEach(elm => elm.classList.remove('active'));
      button.classList.add('active');
      if (action.isApplied()) {
        // If applied, unapply
        FloatStyle.remove(this.img);
        MarginStyle.remove(this.img);
        DisplayStyle.remove(this.img);
        WidthStyle.remove(this.img);
      } else {
        // otherwise, select button and apply
        button.classList.add('active');
        action.apply();
      }
      // image may change position; redraw drag handles
      this.requestUpdate();
    });
    if (action.isApplied()) {
      // select button if previously applied
      button.classList.add('active');
    }
    return button;
  }

  _addToolbarActions = () => {
    this.actions.forEach((action, idx) => {
      let elm;
      if (action.type === 'button') elm = this._button(action, idx);
      if (action.type === 'dropdown' && action.options.length) {
        elm = this._dropdown(action, idx);
      }
      if (elm) this.toolbar.appendChild(elm);
    });
  };

}
