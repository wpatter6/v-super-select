<template>
  <div class="select-container" :class="{'dropdown-visible': dropdownVisible}">
    <label class="select-input" @click="showDropdown">
      <!-- Optional slot to format label -->
      <slot name="label" :label="label">
        <span class="label" :label="label">{{label}}</span>
      </slot>
      <input
        type="text"
        class="input"
        @focus="showDropdown"
        @blur="hideDropdown"
        @keydown="$_keyTextBox"
        :placeholder="placeholder"
        v-model="inputText"
        aria-role="listbox"
        :name="name"
        :autocomplete="autocomplete"
      >
    </label>
    <div class="select-dropdown" :style="{maxHeight: dropdownMaxHeight + 'px'}" ref="dropdown">
      <div class="item-list">
        <div
          v-for="(item, index) in displayItems"
          :key="item[groupNameField] ? item[groupNameField] : item[valueField]"
          :class="{ 'group': !!item[groupNameField], 'item': !isGrouped, 'active': item === activeItem }"
          @click="!isGrouped && selectItem(item, index)"
          :aria-role="!isGrouped ? 'option' : false"
          :aria-selected="!isGrouped && item === activeItem"
          :aria-label="!isGrouped && item[textField]"
        >
          <template v-if="isGrouped && item[childrenField].length">
            <div class="group-name">{{ item[groupNameField] }}</div>
            <div
              v-for="(child, childIndex) in item[childrenField]"
              :key="item[groupNameField] + '_' + child[valueField]"
              :class="['item', { 'active': child === activeItem }]"
              @click="selectItem(child, childIndex, index)"
              aria-role="option"
              :aria-selected="child === activeItem"
              :aria-label="child[textField]"
            >
              <!-- Optional slot to format your grouped items however you like.  Use `item.$html` to show bolded search values. -->
              <slot name="group-item" :item="item">
                <div class="text" v-if="!$slots[group-item]">
                  <i v-if="child[iconClassField]" class="icon" :class="child[iconClassField]"/>
                  <img v-if="child[iconUrlField]" class="icon" :src="child[iconUrlField]">
                  <span v-html="child.$html"></span>
                </div>
                <div
                  v-if="!$slots[group-item]"
                  class="val"
                  :class="{bold: child[valueField].toLowerCase() === inputText}"
                >{{!showValue ? '' : child[valueField]}}</div>
              </slot>
            </div>
          </template>
          <!-- Optional slot to format your items however you like.  Use `item.$html` to show bolded search values. -->
          <slot v-else-if="!isGrouped" name="item" :item="item">
            <div class="text">
              <i v-if="item.icon" class="icon" :class="item.icon"/>
              <span v-html="item.$html"></span>
            </div>
            <div
              class="val"
              :class="{ bold: item[valueField].toLowerCase() === inputText.toLowerCase() }"
            >{{ !showValue ? '' : item[valueField] }}</div>
          </slot>
        </div>
        <div v-if="flattenedItems.length === 0" class="item">
          <div class="text">{{ noneFoundText }}</div>
          <div class="val"></div>
        </div>
      </div>
    </div>
    <div style="display:none">
      <!-- Optional slot to add items the 'old' way with option tags, ex: <option value="1">Item 1</option>-->
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VNode } from 'vue'

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
  },
  data() {
    return {
      inputText: '',
      dropdownVisible: false,
      prevText: '',
      selectedItemIndex: -1,
      originalFilter: null,
      dropdownMaxHeight: 300,
      isMounted: false,
    }
  },
  methods: {
    // Used to select an item.
    selectItem(item: any, itemIndex: number) {
      this.prevText = this.inputText = item[this.textField]
      this.selectedItemIndex = itemIndex
      this.$emit('input', item[this.valueField])
    },
    // Used to hide the dropdown
    hideDropdown() {
      setTimeout(() => {
        this.dropdownVisible = false
        this.originalFilter = null
        if (!this.inputText && this.prevText) {
          this.inputText = this.prevText
        }
      }, 100)
    },
    // Used to show the dropdown
    showDropdown() {
      this.inputText = ''
      this.dropdownVisible = true
      this.dropdownMaxHeight =
        window.innerHeight - this.$refs.dropdown.getBoundingClientRect().top
    },
    $_keyTextBox(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        if (this.selectedItemIndex >= this.flattenedItems.length - 1) {
          this.selectedItemIndex = 0
        } else {
          this.selectedItemIndex++
        }
        if (this.originalFilter === null) {
          this.originalFilter = this.inputText
        }
      } else if (e.key === 'ArrowUp') {
        if (this.selectedItemIndex <= 0) {
          this.selectedItemIndex = this.flattenedItems.length - 1
        } else {
          this.selectedItemIndex--
        }
        if (this.originalFilter === null) {
          this.originalFilter = this.inputText
        }
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (this.activeItem) {
          this.selectItem(this.activeItem, this.selectedItemIndex)
        } else {
          const codeMatch = this.flattenedItems.find(
            (item: any) =>
              item[this.valueField].toLowerCase() ===
              this.inputText.toLowerCase(),
          )
          if (codeMatch) {
            this.selectItem(codeMatch, this.flattenedItems.indexOf(codeMatch))
          }
        }

        this.hideDropdown()
      }
    },
    $_itemMatchesInputText(item: any) {
      return !this.filterText
        ? true
        : item[this.textField]
            .toLowerCase()
            .indexOf(this.filterText.toLowerCase()) > -1 ||
            item[this.valueField].toLowerCase() ===
              this.filterText.toLowerCase()
    },
    $_highlightTextString(val: string) {
      if (this.filterText) {
        return val.replace(
          new RegExp(`(${this.filterText})`, 'gi'),
          '<span class="bold">$1</span>',
        )
      }
      return val
    },
    $_normalizeItems(items: any[]) {
      return items.map(item => ({
        ...item,
        $html: this.$_highlightTextString(item[this.textField]),
      }))
    },
  } as any,
  computed: {
    itemsFromSlot(): any[] | null {
      if (this.isMounted && this.$slots.default) {
        return this.$slots.default.map((item: VNode) => {
          console.log(item.elm)
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
        return this.items.map((group: any) => ({
          [this.groupNameField]: group[this.groupNameField],
          [this.childrenField]: this.$_normalizeItems(
            group[this.childrenField].filter((item: any) =>
              this.$_itemMatchesInputText(item),
            ),
          ),
        }))
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
      return this.flattenedItems[this.selectedItemIndex]
    },
    flattenedItems(): any[] {
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
      return this.originalFilter === null ? this.inputText : this.originalFilter
    },
  },
  mounted() {
    this.isMounted = true
  },
})
</script>

<style lang="scss" scoped>
.select-container {
  .select-input {
    border: 1px solid #aeb0ab;
    background-color: #fff;
    height: 52px;
    width: 185px;
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

    .input {
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
    margin-top: 4px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 2px 2px;
    border: 1px solid #aeb0ab;
    width: 369px;
    background-color: #fff;
    font-size: 14px;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding-top: 8px;
    padding-right: 3px;

    .item-list {
      overflow: auto;

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

      .group {
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        color: #2e3a30;

        .group-name {
          height: 44px;
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
        height: 40px;
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