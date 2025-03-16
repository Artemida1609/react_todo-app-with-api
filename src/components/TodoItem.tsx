import classNames from 'classnames';
import { Todo } from '../types/Todo';
import { deleteTodo, updateTodo } from '../api/todos';
import { useEffect, useRef, useState } from 'react';

type Props = {
  todo: Todo;
  setTodos: (arg: Todo[]) => void;
  allTodos: Todo[];
  setAllTodos: (arg: Todo[]) => void;
  loadingTodo: boolean;
  setErrorMessage: (arg: string) => void;
  setLoadingTodo: (arg: boolean) => void;
  loadingTodoId: number[];
  setLoadingTodoId: (arg: number[]) => void;
  setAllActive: (arg: boolean) => void;
};

export const TodoItem: React.FC<Props> = ({
  todo: { id, completed, title, userId },
  setTodos,
  allTodos,
  setAllTodos,
  loadingTodo,
  setErrorMessage,
  setLoadingTodo,
  loadingTodoId,
  setLoadingTodoId,
  setAllActive,
}) => {
  const titleFocus = useRef<HTMLInputElement>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState('');
  //#region handle functions
  const handleDeleteButton = (todoId: number) => {
    setLoadingTodo(true);
    setLoadingTodoId([todoId]);

    deleteTodo(todoId)
      .then(() => {
        const filtered = allTodos.filter(todoItem => todoItem.id !== todoId);

        setTodos([...filtered]);
        setAllTodos([...filtered]);
        setLoadingTodo(false);
        setLoadingTodoId([]);
      })
      .catch(() => setErrorMessage(`Unable to delete a todo`));
  };

  const handleToggleTodo = () => {
    setLoadingTodo(true);
    setLoadingTodoId([id]);

    const updatedTodo = { id, completed: !completed, title, userId };

    const allCompleted = allTodos.every(todoEl => todoEl.completed);

    setAllActive(allCompleted);

    updateTodo(updatedTodo)
      .then(todoEle => {
        const updatedTodos = allTodos.map(t =>
          t.id === todoEle.id ? updatedTodo : t,
        );

        setTodos(updatedTodos);
        setAllTodos(updatedTodos);
      })
      .catch(() => setErrorMessage('Unable to update a todo'))
      .finally(() => {
        setLoadingTodo(false);
        setLoadingTodoId([]);
      });
  };

  const handleDoubleClick = () => {
    setEditingTitle(true);
    setTitleInputValue(title);
  };

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setLoadingTodo(true);
    setLoadingTodoId([id]);

    const preparedTitle = titleInputValue.trim();

    if (preparedTitle === title) {
      setEditingTitle(false);
    }

    if (preparedTitle.length === 0) {
      handleDeleteButton(id);

      return;
    }

    const updatedTodo = { id, title: preparedTitle, completed, userId };

    updateTodo(updatedTodo)
      .then(todoElement => {
        const updatedTodos = allTodos.map(t =>
          t.id === todoElement.id ? updatedTodo : t,
        );

        setTodos(updatedTodos);
        setAllTodos(updatedTodos);
        setEditingTitle(false);
      })
      .catch(() => {
        setErrorMessage('Unable to update a todo');
      })
      .finally(() => {
        setLoadingTodo(false);
        setLoadingTodoId([]);
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (event.key === 'Escape') {
      setEditingTitle(false);
    }
  };

  const handleBlur = () => {
    const preparedTitle = titleInputValue.trim();

    if (preparedTitle === title) {
      setEditingTitle(false);

      return;
    }

    handleSubmit();
  };
  //#endregion

  useEffect(() => {
    if (titleFocus.current) {
      titleFocus.current.focus();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingTitle) {
      setTitleInputValue(title);
    }
  }, [editingTitle, title]);

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: completed,
      })}
    >
      <label className="todo__status-label" aria-label="toggle todo completion">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className={classNames('todo__status')}
          checked={completed}
          onChange={handleToggleTodo}
        />
      </label>

      {editingTitle ? (
        <form onSubmit={handleSubmit}>
          <input
            ref={titleFocus}
            type="text"
            data-cy="TodoTitleField"
            className="todo__title-field"
            value={titleInputValue}
            onChange={e => {
              setTitleInputValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={handleDoubleClick}
          >
            {title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleDeleteButton(id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': loadingTodo && loadingTodoId.includes(id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
