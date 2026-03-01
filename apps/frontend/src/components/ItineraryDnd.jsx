/**
 * Drag-and-drop for itinerary items: move activities between slots and days.
 * Uses @dnd-kit (useDraggable, useDroppable, DndContext).
 */
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

function itemId(dayIndex, slotIndex, itemIndex) {
  return `item-${dayIndex}-${slotIndex}-${itemIndex}`;
}

function slotId(dayIndex, slotIndex) {
  return `slot-${dayIndex}-${slotIndex}`;
}

export function parseItemId(id) {
  if (typeof id !== "string" || !id.startsWith("item-")) return null;
  const parts = id.slice(5).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  return { dayIndex: parts[0], slotIndex: parts[1], itemIndex: parts[2] };
}

export function parseSlotId(id) {
  if (typeof id !== "string" || !id.startsWith("slot-")) return null;
  const parts = id.slice(5).split("-").map(Number);
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  return { dayIndex: parts[0], slotIndex: parts[1] };
}

function DraggableItem({
  dayIndex,
  slotIndex,
  itemIndex,
  totalItemsInSlot = 1,
  children,
  disabled,
  dragLabel,
  isMobile,
  onMoveUp,
  onMoveDown,
  moveUpLabel,
  moveDownLabel,
}) {
  const id = itemId(dayIndex, slotIndex, itemIndex);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { dayIndex, slotIndex, itemIndex },
  });

  const canMoveUp = itemIndex > 0;
  const canMoveDown = itemIndex < totalItemsInSlot - 1;
  const showArrows = isMobile && !disabled && (onMoveUp || onMoveDown);
  const showDragHandle = !disabled && !showArrows;

  return (
    <li
      ref={setNodeRef}
      className={`planner-item ${isDragging ? "planner-item--dragging" : ""} ${disabled ? "planner-item--no-drag" : ""} ${showArrows ? "planner-item--mobile-arrows" : ""}`}
      key={`day-${dayIndex}-slot-${slotIndex}-item-${itemIndex}`}
    >
      {showArrows && (
        <div className="planner-item-move-buttons" role="group" aria-label={moveUpLabel + " / " + moveDownLabel}>
          <button
            type="button"
            className="planner-item-move-btn planner-item-move-btn--up"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={moveUpLabel}
            title={moveUpLabel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            type="button"
            className="planner-item-move-btn planner-item-move-btn--down"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={moveDownLabel}
            title={moveDownLabel}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
      {showDragHandle && (
        <span
          className="planner-item-drag-handle"
          {...listeners}
          {...attributes}
          role="button"
          tabIndex={0}
          aria-label={dragLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </span>
      )}
      {children}
    </li>
  );
}

function DroppableSlot({ dayIndex, slotIndex, children }) {
  const id = slotId(dayIndex, slotIndex);
  const { setNodeRef, isOver } = useDroppable({ id, data: { dayIndex, slotIndex } });
  const active = isOver;

  return (
    <section
      ref={setNodeRef}
      className={`planner-slot ${active ? "planner-slot--drop-target" : ""}`}
      key={`${dayIndex}-${slotIndex}`}
    >
      {children}
    </section>
  );
}

export function ItineraryDndContext({ onMoveItem, children }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const from = parseItemId(active.id);
    const to = parseSlotId(over.id);
    if (!from || !to) return;
    if (from.dayIndex === to.dayIndex && from.slotIndex === to.slotIndex) return;
    onMoveItem(from.dayIndex, from.slotIndex, from.itemIndex, to.dayIndex, to.slotIndex);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}

export { DraggableItem, DroppableSlot, itemId, slotId };
