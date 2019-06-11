<template>
  <div
    class="select-container"
    :class="{'dropdown-visible': dropdownVisible}"
    :style="{
      '--boxHeight': inputHeight,
      '--boxWidth': inputWidth,
      '--dropDownMaxHeight': dropdownMaxHeightCalc,
      '--itemHeight': itemHeight + 'px',
    }"
  >
    <label ref="field" class="select-input" @click="showDropdown">
      <!-- Optional slot to format label -->
      <slot name="label" :label="label">
        <span class="label" :label="label">{{label}}</span>
      </slot>
      <input
        type="text"
        @focus="showDropdown"
        @blur="hideDropdown"
        @keydown.stop="$_keyTextBox"
        @keypress.stop="$_keyTextBox"
        @keyup.stop="$_keyTextBox"
        :placeholder="placeholder"
        v-model="inputText"
        aria-role="listbox"
        :name="name"
        :autocomplete="autocomplete"
      >
    </label>
    <div class="select-dropdown" :class="{above: dropdownAbove}" ref="dropdown">
      <scroller :size="itemHeight" :remain="remainCount">
        <div
          v-for="item in flattenedItems"
          :key="item.$id"
          :class="{ item: item.$isItem, group: item.$isGroup, active: item.$isActive }"
          @click="!item.$isGroup && selectItem(item)"
        >
          <slot v-if="item.$isGroup" name="group" :group="item">
            <div class="group-name">{{ item[groupNameField] }}</div>
          </slot>
          <slot v-else-if="item.$isItem" name="item" :item="item">
            <div class="text">
              <i v-if="item.icon" class="icon" :class="item.icon"/>
              <span v-html="item.$html"></span>
            </div>
            <div
              class="val"
              :class="{ bold: item && item[valueField] && item[valueField].toLowerCase() === filterText.toLowerCase() }"
            >{{ !showValue ? '' : item[valueField] }}</div>
          </slot>
        </div>
      </scroller>
      <slot v-if="ungroupedItems.length === 0" name="none-found" :text="noneFoundText">
        <div class="item">
          <div class="text">{{ noneFoundText }}</div>
          <div class="val"></div>
        </div>
      </slot>
    </div>
    <div style="display:none">
      <!-- Optional slot to add items the 'old' way with option tags, ex: <option value="1">Item 1</option>-->
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VNode } from 'vue'
/* import { RecycleScroller as Scroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css' */
import Scroller from 'vue-virtual-scroll-list'

export default Vue.extend({
  props: {
    // The label of the dropdown field.
    label: String,
    // The label of the text input.
    name: String,
    // For v-model binding to selected value.
    value: String,
    // Data items to display in the drop down.
    items: Array,
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
    // Css height of the textbox container
    inputHeight: {
      type: String,
      default: '52px',
    },
    // Css width of the textbox container
    inputWidth: {
      type: String,
      default: '185px',
    },
    // Height in pixels of each individual item
    itemHeight: {
      type: Number,
      default: 40,
    },
    // Css max height of dropdown
    dropDownMaxHeight: [Number, String],
  },
  data() {
    return {
      inputText: '',
      prevText: '',
      activeIndex: null,
      selectedIndex: null,
      originalFilter: null,
      dropdownVisible: false,
      dropdownMaxHeightCalc: this.dropDownMaxHeight,
      dropdownAbove: false,
      isMounted: false,
    }
  },
  methods: {
    // Used to select an item.
    selectItem(item: any): void {
      const val = item ? item[this.valueField] : null
      this.prevText = this.inputText = item ? item[this.textField] : null
      this.activeIndex = item ? this.ungroupedItems.indexOf(item) : null
      this.selectedIndex = item ? item.$index : null
      this.$emit('input', item)
      this.$emit('change', item)
      this.$emit('selectedIndexChanged', this.selectedIndex)
    },
    // Clears the drop down selection.
    clearSelection(): void {
      this.selectItem(null)
    },
    // Used to hide the dropdown
    hideDropdown(): void {
      setTimeout(() => {
        this.dropdownVisible = false
        this.originalFilter = null
        if (!this.inputText && this.prevText) {
          this.inputText = this.prevText
        }
        this.$emit('closed')
      }, 100)
    },
    // Used to show the dropdown
    showDropdown(): void {
      this.inputText = ''
      this.dropdownVisible = true
      this.dropdownMaxHeightCalc =
        this.dropDownMaxHeight || this.$_getDropdownMaxHeight() + 'px'

      this.$emit('opened')
    },
    $_getDropdownMaxHeight(): number {
      if (!this.isMounted) {
        return 300
      }
      const underResult =
        window.innerHeight -
        this.$refs.field.getBoundingClientRect().bottom -
        20
      if (underResult > 200) {
        this.dropdownAbove = false
        return underResult
      }
      this.dropdownAbove = true
      return (
        window.innerHeight - underResult - this.$refs.field.offsetHeight - 60
      )
    },
    $_keyTextBox(e: KeyboardEvent): void {
      this.$emit(e.type, e)
      if (e.type !== 'keydown') {
        return
      }
      console.log('key', e.key)

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (e.key === 'ArrowDown') {
          this.activeIndex++
        } else {
          this.activeIndex += this.remainCount
        }

        if (this.activeIndex > this.ungroupedItems.length - 1) {
          this.activeIndex = 0
        }

        if (this.originalFilter === null) {
          this.originalFilter = this.inputText
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageDown') {
        if (e.key === 'ArrowUp') {
          this.activeIndex--
        } else {
          this.activeIndex -= this.remainCount
        }

        if (this.activeIndex < 0) {
          this.activeIndex = this.ungroupedItems.length - 1
        }

        if (this.originalFilter === null) {
          this.originalFilter = this.inputText
        }
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (this.activeItem) {
          this.selectItem(this.activeItem)
        } else {
          const codeMatch = this.ungroupedItems.find(
            (item: any) =>
              item &&
              item[this.valueField] &&
              item[this.valueField].toLowerCase() ===
                this.filterText.toLowerCase(),
          )
          if (codeMatch) {
            this.selectItem(codeMatch)
          }
        }

        this.hideDropdown()
      } else if (e.key === 'Escape') {
        this.clearSelection()
        this.hideDropdown()
        return
      } else {
        return
      }

      const scrollEl = this.$refs.dropdown.children[0]
      const realIndex =
        this.activeIndex + (this.activeItem.$groupIndex + 1 || 0)
      const scrollPos = realIndex * this.itemHeight
      const scrollAmt = Math.ceil((this.remainCount * this.itemHeight) / 1.5)

      if (realIndex === this.flattenedItems.length - 1) {
        scrollEl.scrollTo(0, scrollEl.scrollHeight)
      } else if (this.activeIndex === 0) {
        scrollEl.scrollTo(0, 0)
      } else if (scrollPos < scrollEl.scrollTop) {
        scrollEl.scrollBy({
          top: -1 * scrollAmt,
          behavior: 'smooth',
        })
      } else if (
        scrollPos + this.itemHeight >
        scrollEl.scrollTop + scrollEl.offsetHeight
      ) {
        scrollEl.scrollBy({
          top: scrollAmt,
          behavior: 'smooth',
        })
      }
    },
    $_itemMatchesInputText(item: any): boolean {
      return !this.filterText
        ? true
        : item &&
            item[this.textField] &&
            this.filterText &&
            (item[this.textField]
              .toLowerCase()
              .indexOf(this.filterText.toLowerCase()) > -1 ||
              item[this.valueField].toLowerCase() ===
                this.filterText.toLowerCase())
    },
    $_highlightTextString(val: string): string {
      if (this.filterText) {
        return val.replace(
          new RegExp(`(${this.filterText})`, 'gi'),
          '<span class="bold">$1</span>',
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
        $id: item[this.valueField] + '_item',
        $html: this.$_highlightTextString(item[this.textField]),
        $isActive: index + lastItemIndex === this.activeIndex,
      }))
    },
  } as any,
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
            [this.childrenField]: this.$_normalizeItems(
              group[this.childrenField],
              index,
              len,
            ).filter((item: any) => this.$_itemMatchesInputText(item)),
          })
          len += group[this.childrenField].length
        })

        return result.filter((group: any) => group[this.childrenField].length)
      }

      if (this.items) {
        return this.$_normalizeItems(
          this.items.filter((item: any) => this.$_itemMatchesInputText(item)),
        )
      }

      if (this.itemsFromSlot) {
        return this.$_normalizeItems(
          this.itemsFromSlot.filter((item: any) =>
            this.$_itemMatchesInputText(item),
          ),
        )
      }
      if (this.loaded) {
        console.error('Items were not found to display in v-super-select')
      }
      return []
    },
    isGrouped(): boolean {
      return (
        this.items &&
        this.items.length > 0 &&
        !!this.items[0][this.groupNameField]
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
    filterText(): string | null {
      return (
        (this.originalFilter === null ? this.inputText : this.originalFilter) ||
        ''
      )
    },
    remainCount(): number {
      return Math.min(
        this.flattenedItems.length,
        Math.floor(this.$_getDropdownMaxHeight() / this.itemHeight),
      )
    },
  },
  mounted() {
    this.isMounted = true
  },
  components: {
    Scroller,
  },
})
</script>

<style lang="scss" scoped>
.select-container {
  position: relative;

  .select-input {
    border: 1px solid #aeb0ab;
    background-color: #fff;
    height: var(--boxHeight, 52px);
    width: var(--boxWidth, 185px);
    cursor: pointer;
    padding: 9px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;

    .label {
      color: #60635a;
      font-size: 11px;
      line-height: 15px;
      text-transform: uppercase;
      letter-spacing: 0.09px;
      font-weight: 400;
    }

    input {
      border: 0;
      width: 100%;
      font-size: 16px;
      line-height: 22px;
      cursor: pointer;
      outline: none;
      color: #60635a;
      overflow: hidden;
      text-overflow: ellipsis;

      &::placeholder {
        color: #aeb0ab;
        opacity: 1;
      }
    }
  }

  .select-dropdown {
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

    .group {
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      color: #2e3a30;

      .group-name {
        height: var(--itemHeight, 40px);
        display: flex;
        align-items: center;
        font-weight: 600;
        border-bottom: 1px solid #aeb0ab;
        font-size: 14px;
        margin-left: 17px;
        margin-right: 5px;
      }
    }

    .item {
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

      .val {
        color: #60635a;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.1px;
        margin-right: 6px;
      }

      ::v-deep .bold {
        font-weight: 600;
      }
    }

    &.above {
      margin-top: 0;
      bottom: calc(24px + var(--boxHeight, 300px));
    }
  }

  &.dropdown-visible {
    z-index: 1;

    .select-input {
      box-shadow: 0 0 2px #007099;
      border-radius: 2px 0 0 2px;
      border: 1px solid #007099;

      .input {
        color: #2e3a30;
      }
    }

    .select-dropdown {
      display: flex;
    }
  }
}
</style>