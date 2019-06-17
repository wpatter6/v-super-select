<template>
  <div
    class="super-select-container"
    :disabled="disabled"
    :class="{'super-select-dropdown-visible': dropdownVisible, 'super-select-native': nativeMobile}"
    :style="{
      '--boxHeight': inputHeight,
      '--boxWidth': inputWidth,
      '--dropDownMaxHeight': dropdownMaxHeightCalc,
      '--itemHeight': itemHeight + 'px',
      '--mobileHeaderBackgroundColor': mobileHeaderBackgroundColor,
      '--mobileHeaderBorderBottom': mobileHeaderBorderBottom,
    }"
  >
    <div class="super-select-mobile-header">
      <div class="super-select-left-arrow" @click="hideDropdown"></div>
      <div class="super-select-long-label">Select your {{longLabel || label}}</div>
    </div>
    <label ref="field" class="super-select-input" aria-hidden="true">
      <!-- Optional slot to format label -->
      <slot name="label" :label="label">
        <span class="label" :label="label">{{label}}</span>
      </slot>
      <input
        type="text"
        ref="input"
        @focus="showDropdown"
        @blur="hideDropdown"
        :placeholder="placeholder"
        v-model.lazy="inputText"
        v-debounce="debounceTime"
        aria-role="listbox"
        aria-haspopup="true"
        aria-autocomplete="list"
        :spellcheck="spellcheck ? 'true' : 'false'"
        :aria-owns="'super-super-select-dropdown-' + uid"
        :aria-label="label"
        :name="name"
        :autocomplete="autocomplete"
        :disabled="disabled"
        @keydown.stop="$_keyTextBox"
        @keypress.stop="$_keyTextBox"
        @keyup.stop="$_keyTextBox"
      >
      <select
        v-if="nativeMobile"
        :class="{'super-select-placeholder': selectedIndex === null}"
        @input="selectValue($event.target.value), clearFilter()"
      >
        <option value disabled selected>{{placeholder}}</option>
        <option
          v-for="item in ungroupedItems"
          :value="item[valueField]"
          :key="item[valueField]"
        >{{item[textField]}}</option>
      </select>
    </label>
    <div
      class="super-select-dropdown"
      :id="'super-super-select-dropdown-' + uid"
      :class="{above: dropdownAbove}"
      ref="dropdown"
    >
      <scroller :size="itemHeight" :remain="remainCount">
        <div
          v-for="item in flattenedItems"
          :key="item.$id"
          :class="{ 'super-select-item': item.$isItem, 'super-select-group': item.$isGroup, active: item === activeItem }"
          @click="item.$isItem && selectItem(item)"
          :aria-role="item.$isItem ? 'option' : false"
        >
          <slot v-if="item.$isGroup" name="group" :group="item">
            <div class="super-select-group-name">{{ item[groupNameField] }}</div>
          </slot>
          <slot v-else-if="item.$isItem" name="item" :item="item">
            <div class="super-select-text">
              <i
                v-if="item[iconClassField]"
                class="super-select-icon"
                :class="item[iconClassField]"
              />
              <img
                v-if="item[iconUrlField]"
                :src="item[iconUrlField]"
                class="super-select-icon-img"
              >
              <span v-html="item.$html"></span>
            </div>
            <div
              class="super-select-val"
              :class="{ 'super-select-em': item && item[valueField] && item[valueField].toLowerCase() === filterText.toLowerCase() }"
            >{{ !showValue ? '' : item[valueField] }}</div>
          </slot>
        </div>
      </scroller>
      <slot v-if="ungroupedItems.length === 0" name="none-found" :text="noneFoundText">
        <div class="super-select-item">
          <div class="super-select-text">{{ noneFoundText }}</div>
          <div class="super-select-val"></div>
        </div>
      </slot>
    </div>
    <div style="display:none">
      <!-- Optional slot to add items the 'old' way with option tags, ex: <option value="1">Item 1</option>-->
      <slot></slot>
    </div>
    <div class="super-select-assistive-text" aria-live="polite" aria-relevant="additions">
      <div v-for="(text, index) in textToRead" :key="index">{{text}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VNode } from 'vue'
import Scroller from 'vue-virtual-scroll-list'
import debounce from 'v-debounce'
let uid = 0

export default Vue.extend({
  props: {
    // The label of the dropdown field.
    label: String,
    // The full unabbreviated label of the dropdown field.
    longLabel: String,
    // The label of the text input.
    name: String,
    // For v-model binding to selected value.
    value: {
      type: [String, Object],
    },
    // Data items to display in the drop down.
    items: Array,
    // Field is disabled.
    disabled: {
      type: Boolean,
      default: false,
    },
    // Placeholder text to display when no value is selected.
    placeholder: {
      type: String,
      default: 'Select an Item...',
    },
    // Value for autocomplete of input tag.
    autocomplete: {
      type: String,
      default: 'nope',
    },
    // Property of the top level item that indicates the name of the group.
    groupNameField: {
      type: String,
      default: 'groupName',
    },
    // Property of the top level item that contains child items of a group.
    childrenField: {
      type: String,
      default: 'items',
    },
    // Property of the item that contains its value.
    valueField: {
      type: String,
      default: 'value',
    },
    // Property of the item that contains its text to display.
    textField: {
      type: String,
      default: 'text',
    },
    // Property of the item that contains the icon url.
    iconUrlField: {
      type: String,
      default: 'iconUrl',
    },
    // Property of the item that contains the icon class.
    iconClassField: {
      type: String,
      default: 'iconClass',
    },
    // Indicates if the value of each item should be shown on the right side of the item.
    showValue: {
      type: Boolean,
      default: true,
    },
    // Text to display when no items are found.
    noneFoundText: {
      type: String,
      default: 'No Results Found',
    },
    // Css height of the textbox container.
    inputHeight: {
      type: String,
      default: '52px',
    },
    // Css width of the textbox container.
    inputWidth: {
      type: String,
      default: '185px',
    },
    // Height in pixels of each individual item.
    itemHeight: {
      type: Number,
      default: 40,
    },
    // Css max height of dropdown.
    dropDownMaxHeight: {
      type: [Number, String],
    },
    // Amount of time to wait after user input before filtering is performed.
    debounceTime: {
      type: Number,
      default: 250,
    },
    // Additional item properties to inspect when searching
    searchFields: {
      type: [String, Array],
      default: () => [],
    },
    // Allows enabling browser spellcheck on input field.
    spellcheck: Boolean,
    // Background color for full-style mobile header.
    mobileHeaderBackgroundColor: {
      type: String,
      default: '#2e3a30',
    },
    // Bottom border color styling for full-style mobile header.
    mobileHeaderBorderBottom: {
      type: String,
      default: 'linear-gradient(to right, #2e3a30, #ccc)',
    },
    // If true, mobile devices will use native select.
    nativeMobile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inputText: '',
      prevText: '',
      activeIndex: 0 as number | null,
      selectedIndex: null as number | null,
      originalFilter: '',
      dropdownVisible: false,
      dropdownMaxHeightCalc: this.dropDownMaxHeight,
      dropdownAbove: false,
      isMounted: false,
      textToRead: [] as string[],
      uid: uid++,
    }
  },
  methods: {
    // Used to select an item.
    selectItem(item: any): void {
      if (this.disabled) {
        return
      }

      const f = (this.$refs.input as HTMLElement).focus()
      const val = item ? item[this.valueField] : null
      this.prevText = this.inputText = item ? item[this.textField] : null
      this.activeIndex = item ? this.ungroupedItems.indexOf(item) : null
      this.selectedIndex = item ? item.$index : null

      this.$_readText(!item ? 'Selection cleared' : 'Selected item')
      this.$emit('input', this.valueIsString ? item[this.valueField] : item)
      this.$emit('change', this.valueIsString ? item[this.valueField] : item)
      this.$emit('selectedIndexChanged', this.selectedIndex)
    },
    selectValue(value: any): void {
      const item = this.ungroupedItems.find(i => i[this.valueField] === value)
      this.selectItem(item)
    },
    // Clears the drop down selection.
    clearSelection(): void {
      if (this.disabled) {
        return
      }
      this.selectItem(null)
    },
    // Used to hide the dropdown
    hideDropdown(): void {
      setTimeout(() => {
        this.dropdownVisible = false
        this.originalFilter = ''
        if (!this.inputText && this.prevText) {
          this.inputText = this.prevText
        }
        this.$_readText(this.label + ' collapsed')
        this.$emit('closed')
      }, 200)
    },
    // Used to show the dropdown
    showDropdown(): void {
      if (this.disabled) {
        return
      }
      this.clearFilter()
      this.dropdownVisible = true
      this.dropdownMaxHeightCalc =
        this.dropDownMaxHeight || this.$_getDropdownMaxHeight() + 'px'
      this.$_debounceAssistiveText(this.label + ' expanded ' + this.ariaText)
      this.$emit('opened')
    },
    clearFilter(): void {
      this.inputText = ''
    },
    $_readText(text: string): void {
      this.textToRead.push(text)
    },
    $_getDropdownMaxHeight(): number {
      if (!this.isMounted) {
        return 300
      }
      const underResult =
        window.innerHeight -
        (this.$refs.field as Element).getBoundingClientRect().bottom -
        20
      if (underResult > 200) {
        this.dropdownAbove = false
        return underResult
      }
      this.dropdownAbove = true
      return (
        window.innerHeight -
        underResult -
        (this.$refs.field as HTMLElement).offsetHeight -
        60
      )
    },
    $_keyTextBox(e: KeyboardEvent): void {
      this.$emit(e.type, e)
      if (e.type !== 'keydown') {
        return
      }

      if (e.key !== 'Tab' && !this.dropdownVisible) {
        this.showDropdown()
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        if (e.key === 'ArrowDown') {
          this.activeIndex = (this.activeIndex || 0) + 1
        } else {
          this.activeIndex = (this.activeIndex || 0) + this.remainCount
        }

        if (this.activeIndex > this.ungroupedItems.length - 1) {
          this.activeIndex = 0
        }

        if (this.originalFilter === null) {
          this.originalFilter = this.inputText
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (e.key === 'ArrowUp') {
          this.activeIndex = (this.activeIndex || 0) - 1
        } else {
          this.activeIndex = (this.activeIndex || 0) - this.remainCount
        }

        if (this.activeIndex < 0) {
          this.activeIndex = this.ungroupedItems.length - 1
        }

        if (this.originalFilter === null) {
          this.originalFilter = this.inputText
        }
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        const codeMatch = this.ungroupedItems.find(
          (item: any) =>
            item &&
            item[this.valueField] &&
            item[this.valueField].toLowerCase() ===
              this.filterText.toLowerCase(),
        )
        if (codeMatch && this.activeIndex === 0) {
          this.selectItem(codeMatch)
        } else if (this.activeItem && (e.key === 'Enter' || this.filterText)) {
          this.selectItem(this.activeItem)
        }

        this.hideDropdown()
      } else if (e.key === 'Escape') {
        this.clearSelection()
        this.hideDropdown()
        return
      } else {
        return
      }

      if (this.activeItem) {
        const scrollEl = (this.$refs.dropdown as Element)
          .children[0] as HTMLElement
        const realIndex =
          this.activeIndex + (this.activeItem.$groupIndex + 1 || 0)
        const scrollPos = realIndex * this.itemHeight
        const scrollHeight = this.remainCount * this.itemHeight

        if (realIndex === this.flattenedItems.length - 1) {
          scrollEl.scrollTo(0, scrollEl.scrollHeight)
        } else if (this.activeIndex === 0) {
          scrollEl.scrollTo(0, 0)
        } else if (scrollPos < scrollEl.scrollTop + this.itemHeight) {
          scrollEl.scrollTo({
            top: scrollPos - scrollHeight + this.itemHeight * 2,
            behavior: 'smooth',
          })
        } else if (
          scrollPos + this.itemHeight >
          scrollEl.scrollTop + scrollEl.offsetHeight
        ) {
          scrollEl.scrollTo({
            top: scrollPos - this.itemHeight * 2,
            behavior: 'smooth',
          })
        }

        this.$_debounceAssistiveText(this.ariaText)
      }
    },
    $_itemMatchesInputText(item: any): boolean {
      if (!item || !item[this.textField]) {
        return false
      }

      this.highlightRegexp.lastIndex = 0
      if (this.highlightRegexp.test(item[this.textField])) {
        return true
      }

      for (const field of this.searchFieldArray) {
        this.highlightRegexp.lastIndex = 0
        if (this.highlightRegexp.test(item[field])) {
          return true
        }
      }

      if (
        item[this.valueField].toLowerCase() === this.filterText.toLowerCase()
      ) {
        return true
      }

      return false
    },
    $_highlightTextString(val: string): string {
      if (this.filterText) {
        return val.replace(
          this.highlightRegexp,
          '<span class="super-select-em">$1</span>',
        )
      }
      return val
    },
    $_normalizeItems(
      items: any[],
      groupIndex?: number,
      lastItemIndex = 0,
    ): any[] {
      return items.map((item, index) => ({
        ...item,
        $isItem: true,
        $index: index + lastItemIndex,
        $groupIndex: groupIndex,
        $id: `${item[this.valueField]}_${groupIndex || 0}_item`,
        $html: this.$_highlightTextString(item[this.textField]),
      }))
    },
    $_debounceAssistiveText(text: string): void {
      console.error('Assistive text debouncing failure')
    },
  },
  computed: {
    itemsFromSlot(): any[] | null {
      if (this.isMounted && this.$slots.default) {
        return this.$slots.default.map((item: VNode) => {
          const text = item.elm instanceof Element ? item.elm.textContent : ''
          const val =
            item.data && item.data.attrs ? item.data.attrs.value : item.text
          return {
            [this.textField]: text || val,
            [this.valueField]: val || text,
          }
        })
      }
      return null
    },
    displayItems(): any[] {
      if (this.isGrouped) {
        const result = [] as any[]
        let len = 0
        this.items.forEach((group: any, index: number) => {
          result.push({
            [this.groupNameField]: group[this.groupNameField],
            [this.childrenField]: this.filterText
              ? this.$_normalizeItems(
                  group[this.childrenField],
                  index,
                  len,
                ).filter(this.$_itemMatchesInputText)
              : this.$_normalizeItems(group[this.childrenField], index, len),
          })
          len += group[this.childrenField].length
        })

        return result.filter((group: any) => group[this.childrenField].length)
      }

      if (this.items) {
        return this.$_normalizeItems(
          this.filterText
            ? this.items.filter(this.$_itemMatchesInputText)
            : this.items,
        )
      }

      if (this.itemsFromSlot) {
        return this.$_normalizeItems(
          this.filterText
            ? this.itemsFromSlot.filter(this.$_itemMatchesInputText)
            : this.itemsFromSlot,
        )
      }
      if (this.isMounted) {
        console.error('Items were not found to display in v-super-select')
      }
      return []
    },
    isGrouped(): boolean {
      return (
        this.items &&
        this.items.length > 0 &&
        !!(this.items[0] as any)[this.groupNameField]
      )
    },
    activeItem(): any {
      if (this.activeIndex === null) {
        return null
      }
      return this.ungroupedItems[this.activeIndex]
    },
    flattenedItems(): any[] {
      if (!this.isGrouped) {
        return this.displayItems
      }

      let result = [] as any[]
      this.displayItems.forEach((group: any) => {
        result.push({
          ...group,
          $isGroup: true,
          $id: group[this.groupNameField] + '_group',
        })
        result = result.concat(group[this.childrenField])
      })
      return result
    },
    ungroupedItems(): any[] {
      if (!this.isGrouped) {
        return this.displayItems
      }

      let result = [] as any[]
      this.displayItems.forEach(
        (group: any) => (result = result.concat(group[this.childrenField])),
      )
      return result
    },
    filterText(): string {
      return (!this.originalFilter ? this.inputText : this.originalFilter) || ''
    },
    filterTextEscaped(): string {
      return this.filterText.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
    },
    remainCount(): number {
      return Math.min(
        this.flattenedItems.length,
        Math.floor(this.$_getDropdownMaxHeight() / this.itemHeight),
      )
    },
    highlightRegexp(): RegExp {
      return new RegExp(`(${this.filterTextEscaped})`, 'gi')
    },
    ariaText(): string {
      if (!this.activeItem) {
        return ''
      }

      return `${this.activeItem[this.textField]} ${(this.activeIndex || 0) +
        1} of ${this.ungroupedItems.length}`
    },
    searchFieldArray(): string[] {
      if (typeof this.searchFields === 'string') {
        return this.searchFields.split(',')
      }
      return this.searchFields as string[]
    },
    valueIsString(): boolean {
      return typeof this.value === 'string'
    },
  },
  mounted() {
    this.$_debounceAssistiveText = debounce.debounce(
      (text: string) => this.$_readText(text),
      this.debounceTime,
    )
    this.isMounted = true
  },
  components: {
    Scroller,
  },
  directives: {
    debounce,
  },
})
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

.super-select-em {
  font-weight: 600;
}

.super-select-container {
  position: relative;
  color: #60635a;
  font-size: 11px;
  line-height: 15px;
  letter-spacing: 0.09px;
  font-weight: 400;
  height: var(--boxHeight, 52px);
  display: flex;
  max-width: 185px;

  &.super-select-dropdown-visible {
    z-index: 1;

    .super-select-input {
      box-shadow: 0 0 2px #007099;
      border-radius: 2px 0 0 2px;
      border: 1px solid #007099;

      input {
        color: #2e3a30;
      }
    }

    .super-select-dropdown {
      display: flex;
    }
  }

  &[disabled] {
    cursor: default;
    color: #888;
    background-color: #eee;

    input,
    * {
      cursor: default;
      color: #888;
      background-color: #eee;
    }
  }
}

.super-select-input {
  border: 1px solid #aeb0ab;
  background-color: #fff;
  height: var(--boxHeight, 52px);
  flex-basis: var(--boxWidth, 185px);
  cursor: pointer;
  padding: 9px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  text-transform: uppercase;

  input,
  select {
    border: 0;
    width: 100%;
    font-size: 16px;
    line-height: 22px;
    cursor: pointer;
    outline: none;
    color: #60635a;
    overflow: hidden;
    text-overflow: ellipsis;

    &::placeholder,
    &.super-select-placeholder:not(:focus) {
      color: #aeb0ab;
      opacity: 1;
    }
  }

  select {
    display: none;
  }
}

.super-select-mobile-input {
  display: none;
}

.super-select-dropdown {
  display: none;
  z-index: 0;
  position: absolute;
  margin: 4px 0;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 2px 2px;
  border: 1px solid #aeb0ab;
  width: 369px;
  background-color: #fff;
  font-size: 14px;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 8px 3px 4px 0;
  max-height: var(--dropDownMaxHeight, 300px);
  overflow-x: hidden;

  & > *::v-deep {
    &::-webkit-scrollbar-track {
      background-color: #fff;
    }

    &::-webkit-scrollbar {
      width: 6px;
      border-radius: 50%;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background-color: #afb1ac;
    }
  }

  &.above {
    margin-top: 0;
    bottom: calc(24px + var(--boxHeight, 300px));
  }
}

.super-select-item {
  height: var(--itemHeight, 40px);
  color: #2e3a30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 17px;
  cursor: pointer;

  &:hover,
  &:active,
  &.active {
    background-color: #e9e9e4;
  }
}

.super-select-text {
  display: flex;
  align-items: center;
}

.super-select-icon,
.super-select-icon-img {
  margin-right: 10px;
}

.super-select-val {
  color: #60635a;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.1px;
  margin-right: 6px;
}

.super-select-group {
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  color: #2e3a30;
  position: sticky;
  top: -1px;
  background-color: #fff;
  width: 100%;
}

.super-select-group-name {
  height: var(--itemHeight, 40px);
  display: flex;
  align-items: center;
  font-weight: 600;
  border-bottom: 1px solid #aeb0ab;
  font-size: 14px;
  margin-left: 17px;
  margin-right: 5px;
}

.super-select-assistive-text {
  position: absolute;
  margin: -1px;
  border: 0;
  padding: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.super-select-mobile-header {
  display: none;
}

@media (max-width: 480px) {
  .super-select-container {
    transition: all 0.3s;

    &.super-select-dropdown-visible {
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background-color: var(--mobileHeaderBackgroundColor, #2e3a30);
      color: #fff;
      font-size: 17px;
      z-index: 10;
      max-width: 100vw;
      flex-direction: column;

      .super-select-mobile-header {
        display: flex;
      }

      .super-select-input {
        width: 100%;
        border: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
        padding: 15px;
        background-color: transparent;
        height: 72px;
        max-height: 72px;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          z-index: 1;
          bottom: -6px;
          left: 0;
          height: 6px;
          width: 100%;
          background: var(--mobileHeaderBorderBottom, #ccc);
        }

        .label {
          display: none;
        }

        input {
          height: 40px;
          border: 1px solid #e9e9e4;
          background-color: #f9f9f9;
          border-radius: 3px;
          padding-left: 12px;

          &:focus {
            box-shadow: 0 0 2px rgba(0, 172, 236, 0.45);
            border: 1px solid #007099;
          }

          &::placeholder {
            font-size: 13px;
            letter-spacing: 0.05px;
          }
        }
      }
    }

    &.super-select-native {
      .super-select-input {
        input {
          display: none;
        }
        select {
          display: block;
          margin-left: -3px;
          box-shadow: inset 0 100px 0 0 white;
        }
      }
    }
  }

  .super-select-dropdown,
  .super-select-dropdown.above {
    box-shadow: none;
    border: 0;
    width: 100vw;
    top: 140px;
    bottom: -5px;
    max-height: 100vh;

    & > * {
      height: 100% !important;
    }
  }

  .super-select-mobile-header {
    align-items: flex-start;
    justify-content: flex-start;
    height: 51px;
    padding-top: 12px;
    margin: 15px;
    margin-bottom: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  }

  .super-select-left-arrow {
    background-color: transparent;
    background: url(./assets/left-arrow.png) no-repeat;
    background-size: cover;
    cursor: pointer;
    width: 22px;
    height: 15px;
    margin-left: 5px;
    margin-right: 54px;
  }
}
</style>