import { AddProblem } from '@/admin/pages/AddProblem'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/admin/problems/create')({
  component: () => <AddProblem />
})
