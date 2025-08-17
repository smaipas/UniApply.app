import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '../UiButton.vue'
import UiIcon from '../UiIcon.vue'
import { mdiAccount } from '@mdi/js'

describe('UiButton.vue', () => {
  it('renders without an icon', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.findComponent(UiIcon).exists()).toBe(false)
  })

  it('renders with an icon', () => {
    const wrapper = mount(UiButton, {
      props: {
        icon: mdiAccount,
      },
    })
    expect(wrapper.findComponent(UiIcon).exists()).toBe(true)
  })

  it('applies flat styles', () => {
    const wrapper = mount(UiButton, {
      props: {
        flat: true,
      },
    })
    expect(wrapper.classes()).toContain('!bg-transparent')
    expect(wrapper.classes()).toContain('!border-transparent')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(UiButton, {
      props: {
        disabled: true,
      },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('is not disabled by default', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })
})
