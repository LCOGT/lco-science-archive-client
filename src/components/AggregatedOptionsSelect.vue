<template>
  <div>
    <slot name="label"
      ><b>{{ label }}</b></slot
    >
    <b-dropdown block class="my-1" menu-class="menu" boundary="viewport" variant="outline-secondary" @shown="initializeKeyboardSelection">
      <template #button-content>
        <span v-if="value">{{ value | truncate }}</span>
        <span v-else>{{ allOptionText | truncate }}</span>
      </template>
      <b-dropdown-form form-class="px-1">
        <b-form-input ref="filter" v-model="filterOptionsBy" @keydown="onFilterKeydown"></b-form-input>
      </b-dropdown-form>
      <b-dropdown-item
        href="#"
        :active="isOptionActive(allValue)"
        @mouseenter.native="highlightOption(allValue)"
        @focus.native="highlightOption(allValue)"
        @click="onUpdate(allValue)"
      >
        {{ allOptionText }}
      </b-dropdown-item>
      <slot name="first">
        <b-dropdown-group v-if="placeFirstOptionsInGroup && filteredFirstOptions.length > 0" :header="firstOptionGroupLabel">
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item
            v-for="option in filteredFirstOptions"
            :key="option"
            :active="isOptionActive(option)"
            @mouseenter.native="highlightOption(option)"
            @focus.native="highlightOption(option)"
            @click="onUpdate(option)"
          >
            {{ option }}
          </b-dropdown-item>
        </b-dropdown-group>
        <template v-else-if="filteredFirstOptions.length > 0">
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item
            v-for="option in filteredFirstOptions"
            :key="option"
            :active="isOptionActive(option)"
            @mouseenter.native="highlightOption(option)"
            @focus.native="highlightOption(option)"
            @click="onUpdate(option)"
          >
            {{ option }}
          </b-dropdown-item>
        </template>
      </slot>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-group v-if="placeInOptionGroup" :header="optionGroupLabel">
        <b-dropdown-item
          v-for="available in filteredOptions.available"
          :key="available"
          :active="isOptionActive(available)"
          @mouseenter.native="highlightOption(available)"
          @focus.native="highlightOption(available)"
          @click="onUpdate(available)"
        >
          {{ available }}
        </b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item
          v-for="unavailable in filteredOptions.unavailable"
          :key="unavailable"
          :active="isOptionActive(unavailable)"
          link-class="text-muted"
          @mouseenter.native="highlightOption(unavailable)"
          @focus.native="highlightOption(unavailable)"
          @click="onUpdate(unavailable)"
        >
          {{ unavailable }}
        </b-dropdown-item>
      </b-dropdown-group>
      <template v-else>
        <b-dropdown-item
          v-for="available in filteredOptions.available"
          :key="available"
          :active="isOptionActive(available)"
          @mouseenter.native="highlightOption(available)"
          @focus.native="highlightOption(available)"
          @click="onUpdate(available)"
        >
          {{ available }}
        </b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item
          v-for="unavailable in filteredOptions.unavailable"
          :key="unavailable"
          :active="isOptionActive(unavailable)"
          link-class="text-muted"
          @mouseenter.native="highlightOption(unavailable)"
          @focus.native="highlightOption(unavailable)"
          @click="onUpdate(unavailable)"
        >
          {{ unavailable }}
        </b-dropdown-item>
      </template>
    </b-dropdown>
  </div>
</template>
<script>
import _ from 'lodash';

export default {
  name: 'AggregatedOptionsSelect',
  filters: {
    truncate: function(value) {
      return _.truncate(value, { length: 12 });
    }
  },
  props: {
    options: {
      type: Object,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    placeInOptionGroup: {
      type: Boolean
    },
    optionGroupLabel: {
      type: String,
      default: 'Options'
    },
    allOptionText: {
      type: String,
      default: 'All'
    },
    firstOptions: {
      type: Array,
      default: () => {
        return [];
      }
    },
    placeFirstOptionsInGroup: {
      type: Boolean
    },
    firstOptionGroupLabel: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      // Value used for the `All` option
      allValue: '',
      filterOptionsBy: '',
      highlightedOptionIndex: 0
    };
  },
  computed: {
    filteredOptions: function() {
      let options = { available: [], unavailable: [] };
      for (let state of ['available', 'unavailable']) {
        options[state] = this.filterOptions(this.options[state]);
      }
      return options;
    },
    filteredFirstOptions: function() {
      return this.filterOptions(this.firstOptions);
    },
    keyboardOptions: function() {
      return [this.allValue]
        .concat(this.filteredFirstOptions)
        .concat(this.filteredOptions.available)
        .concat(this.filteredOptions.unavailable);
    }
  },
  watch: {
    filterOptionsBy: function() {
      let filter = _.toUpper(this.filterOptionsBy);
      let exactMatchIndex = this.keyboardOptions.findIndex(function(option) {
        return _.toUpper(option) === filter;
      });
      this.highlightedOptionIndex = exactMatchIndex === -1 ? 0 : exactMatchIndex;
      this.scrollHighlightedOptionIntoView();
    }
  },
  methods: {
    filterOptions: function(options) {
      let exactMatches = [];
      let otherMatches = [];
      let filter = _.toUpper(this.filterOptionsBy);

      for (let option of options) {
        let upperOption = _.toUpper(option);
        if (upperOption === filter) {
          exactMatches.push(option);
        } else if (_.includes(upperOption, filter)) {
          otherMatches.push(option);
        }
      }

      return exactMatches.concat(otherMatches);
    },
    initializeKeyboardSelection: function() {
      this.highlightedOptionIndex = this.keyboardOptions.indexOf(this.value);
      this.$refs.filter.focus();
      this.scrollHighlightedOptionIntoView();
    },
    isOptionActive: function(option) {
      return this.keyboardOptions[this.highlightedOptionIndex] === option;
    },
    highlightOption: function(option) {
      this.highlightedOptionIndex = this.keyboardOptions.indexOf(option);
    },
    onFilterKeydown: function(event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        let change = event.key === 'ArrowDown' ? 1 : -1;
        this.highlightedOptionIndex = (this.highlightedOptionIndex + change + this.keyboardOptions.length) % this.keyboardOptions.length;
        this.scrollHighlightedOptionIntoView();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        let highlightedOption = this.keyboardOptions[this.highlightedOptionIndex];
        this.onUpdate(highlightedOption);
      }
    },
    scrollHighlightedOptionIntoView: function() {
      this.$nextTick(() => {
        this.$el
          .querySelector('.menu')
          .querySelectorAll('.dropdown-item')
          [this.highlightedOptionIndex].scrollIntoView({ block: 'nearest' });
      });
    },
    onUpdate: function(value) {
      this.$emit('input', value);
    }
  }
};
</script>
<style>
.menu {
  max-height: 200px;
  overflow-y: scroll;
}

.menu .dropdown-item {
  outline: none;
  box-shadow: none;
}

.menu .dropdown-item.active {
  background-color: #00adef;
  color: #fff;
}

.menu .dropdown-item:hover:not(.active),
.menu .dropdown-item:focus:not(.active) {
  background-color: transparent;
  color: inherit;
}
</style>
