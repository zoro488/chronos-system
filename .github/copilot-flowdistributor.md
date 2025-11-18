# GitHub Copilot Instructions - FlowDistributor

## Application Context
FlowDistributor is the workflow management system within the Premium Ecosystem. It handles:
- Workflow creation and orchestration
- Task distribution and assignment
- Real-time status tracking
- Team collaboration on workflows
- Analytics and reporting

## Architecture

### Clean Architecture Layers
```
src/apps/FlowDistributor/
├── domain/           # Business logic (pure)
│   ├── entities/     # Core business entities
│   ├── useCases/     # Business use cases
│   └── repositories/ # Repository interfaces
├── application/      # Application services
│   ├── services/     # Application services
│   └── dto/          # Data transfer objects
├── infrastructure/   # External integrations
│   ├── firebase/     # Firebase implementations
│   ├── api/          # API clients
│   └── cache/        # Caching layer
└── presentation/     # UI Layer
    ├── components/   # React components
    ├── pages/        # Page components
    ├── hooks/        # Custom hooks
    └── stores/       # State management
```

## Domain Entities

### Workflow
```typescript
interface Workflow {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tasks: Task[]
  assignees: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: Date
  tags: string[]
  metadata: Record<string, any>
}
```

### Task
```typescript
interface Task {
  id: string
  workflowId: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked'
  assignedTo: string[]
  dependencies: string[] // Task IDs
  estimatedHours: number
  actualHours?: number
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  priority: number
  attachments: Attachment[]
  comments: Comment[]
}
```

## Use Cases

### Create Workflow Use Case
```typescript
class CreateWorkflowUseCase {
  constructor(
    private workflowRepository: IWorkflowRepository,
    private authService: IAuthService,
    private validationService: IValidationService
  ) {}

  async execute(data: CreateWorkflowDTO): Promise<Result<Workflow>> {
    // Validate input
    const validationResult = this.validationService.validate(data)
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error)
    }

    // Check permissions
    const user = await this.authService.getCurrentUser()
    if (!user.hasPermission('workflow.create')) {
      return Result.fail('Insufficient permissions')
    }

    // Create workflow
    const workflow = Workflow.create(data)
    await this.workflowRepository.save(workflow)

    return Result.ok(workflow)
  }
}
```

## Firebase Collections Structure

### workflows
```typescript
{
  id: string
  name: string
  description: string
  status: string
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  assignees: string[]
  priority: string
  deadline: Timestamp | null
  tags: string[]
  metadata: object
}
```

### tasks
```typescript
{
  id: string
  workflowId: string
  title: string
  description: string
  status: string
  assignedTo: string[]
  dependencies: string[]
  estimatedHours: number
  actualHours: number | null
  startDate: Timestamp | null
  dueDate: Timestamp | null
  completedAt: Timestamp | null
  priority: number
}
```

### task_comments
```typescript
{
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Timestamp
  mentions: string[]
  attachments: string[]
}
```

## Real-Time Listeners

### Workflow Status Updates
```typescript
function useWorkflowRealtime(workflowId: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'workflows', workflowId),
      (snapshot) => {
        if (snapshot.exists()) {
          setWorkflow(snapshot.data() as Workflow)
        }
      },
      (error) => {
        console.error('Workflow listener error:', error)
        Sentry.captureException(error)
      }
    )

    return () => unsubscribe()
  }, [workflowId])

  return workflow
}
```

## State Management (Zustand)

```typescript
interface WorkflowStore {
  workflows: Workflow[]
  selectedWorkflow: Workflow | null
  filters: WorkflowFilters
  isLoading: boolean
  error: Error | null

  // Actions
  setWorkflows: (workflows: Workflow[]) => void
  selectWorkflow: (workflow: Workflow | null) => void
  updateFilters: (filters: Partial<WorkflowFilters>) => void
  createWorkflow: (data: CreateWorkflowDTO) => Promise<void>
  updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
}

const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: [],
  selectedWorkflow: null,
  filters: { status: 'all', priority: 'all' },
  isLoading: false,
  error: null,

  setWorkflows: (workflows) => set({ workflows }),
  selectWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  updateFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  createWorkflow: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const workflow = await workflowService.create(data)
      set({ workflows: [...get().workflows, workflow], isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },

  updateWorkflow: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await workflowService.update(id, data)
      const workflows = get().workflows.map(w =>
        w.id === id ? { ...w, ...data } : w
      )
      set({ workflows, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },

  deleteWorkflow: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await workflowService.delete(id)
      set({
        workflows: get().workflows.filter(w => w.id !== id),
        isLoading: false
      })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  }
}))
```

## Performance Optimizations

### Virtual Scrolling for Task Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function TaskList({ tasks }: { tasks: Task[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <TaskCard key={virtualRow.key} task={tasks[virtualRow.index]} />
        ))}
      </div>
    </div>
  )
}
```

### Optimistic Updates
```typescript
const updateTaskStatus = useMutation({
  mutationFn: (data: { taskId: string; status: TaskStatus }) =>
    taskService.updateStatus(data.taskId, data.status),

  onMutate: async (data) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['tasks'])

    // Snapshot previous value
    const previous = queryClient.getQueryData(['tasks'])

    // Optimistically update
    queryClient.setQueryData(['tasks'], (old: Task[]) =>
      old.map(task =>
        task.id === data.taskId ? { ...task, status: data.status } : task
      )
    )

    return { previous }
  },

  onError: (err, data, context) => {
    // Rollback on error
    queryClient.setQueryData(['tasks'], context?.previous)
  },

  onSettled: () => {
    queryClient.invalidateQueries(['tasks'])
  }
})
```

## Security Rules

### Firestore Security
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workflows/{workflowId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         request.auth.uid in resource.data.assignees);

      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.createdBy;

      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         request.auth.uid in resource.data.assignees);

      allow delete: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;
    }

    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/workflows/$(resource.data.workflowId));
    }
  }
}
```

## Component Patterns

### Workflow Board (Kanban)
```typescript
function WorkflowBoard({ workflowId }: { workflowId: string }) {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', workflowId],
    queryFn: () => taskService.getByWorkflow(workflowId)
  })

  const columns = useMemo(() =>
    groupBy(tasks, 'status'), [tasks]
  )

  if (isLoading) return <BoardSkeleton />

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Object.entries(columns).map(([status, tasks]) => (
        <BoardColumn
          key={status}
          status={status as TaskStatus}
          tasks={tasks}
        />
      ))}
    </div>
  )
}
```

## Testing Strategy

### Unit Tests (Domain Logic)
```typescript
describe('CreateWorkflowUseCase', () => {
  it('should create workflow with valid data', async () => {
    const useCase = new CreateWorkflowUseCase(
      mockWorkflowRepo,
      mockAuthService,
      mockValidationService
    )

    const result = await useCase.execute({
      name: 'Test Workflow',
      description: 'Test'
    })

    expect(result.isSuccess).toBe(true)
    expect(result.value).toHaveProperty('id')
  })

  it('should fail with invalid data', async () => {
    const useCase = new CreateWorkflowUseCase(
      mockWorkflowRepo,
      mockAuthService,
      mockValidationService
    )

    const result = await useCase.execute({
      name: '',
      description: ''
    })

    expect(result.isFailure).toBe(true)
  })
})
```

### E2E Tests (Critical Flows)
```typescript
test('should complete workflow lifecycle', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Create workflow
  await page.click('text=New Workflow')
  await page.fill('[name="name"]', 'Test Workflow')
  await page.click('button:has-text("Create")')

  // Verify creation
  await expect(page.locator('text=Test Workflow')).toBeVisible()

  // Complete workflow
  await page.click('text=Mark Complete')
  await expect(page.locator('text=Completed')).toBeVisible()
})
```

## Code Generation Guidelines

1. **Always use TypeScript interfaces** for all entities
2. **Implement Clean Architecture** - keep domain logic pure
3. **Use React Query** for all async operations
4. **Add error boundaries** around major features
5. **Implement optimistic updates** for better UX
6. **Add loading states** with skeleton screens
7. **Include accessibility attributes** (aria-labels, roles)
8. **Write tests** for business logic and critical flows
9. **Document complex logic** with inline comments
10. **Follow naming conventions** - use descriptive names

---

**Remember**: FlowDistributor is the core workflow engine. Code must be performant, reliable, and maintainable.
