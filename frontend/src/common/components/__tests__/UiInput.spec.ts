import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiInput from '../UiInput.vue'
import UiIcon from '../UiIcon.vue'
import { mdiAccount } from '@mdi/js'

describe('UiInput.vue', () => {
  it('renders without an icon', () => {
    const wrapper = mount(UiInput)
    expect(wrapper.findComponent(UiIcon).exists()).toBe(false)
  })

  it('renders with an icon', () => {
    const wrapper = mount(UiInput, {
      props: {
        icon: mdiAccount,
      },
    })
    expect(wrapper.findComponent(UiIcon).exists()).toBe(true)
  })

  it('has correct padding when icon is present', () => {
    const wrapper = mount(UiInput, {
      props: {
        icon: mdiAccount,
      },
    })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('pl-10')
  })

  it('has correct padding when icon is not present', () => {
    const wrapper = mount(UiInput)
    const input = wrapper.find('input')
    expect(input.classes()).toContain('px-3')
  })
})
