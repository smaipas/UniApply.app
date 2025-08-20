/**
 * Format a date string to dd/mm/yyyy hh:mm format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString // Return original on error
  }
}

/**
 * Format a date string to dd/mm/yyyy format (date only)
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString // Return original on error
  }
}
