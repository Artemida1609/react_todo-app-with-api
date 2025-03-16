import classNames from 'classnames';
// import React, { useEffect } from 'react';
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
  todo,
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
    // Встановлюємо тудушку на load та todoId
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
    setLoadingTodoId([todo.id]);

    const updatedTodo = { ...todo, completed: !todo.completed };

    const allCompleted = allTodos.every(todoEl => todoEl.completed);

    setAllActive(allCompleted);

    //toggle completed or not todo
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
    setTitleInputValue(todo.title);
  };

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setLoadingTodo(true);
    setLoadingTodoId([todo.id]);

    const preparedTitle = titleInputValue.trim();

    if (preparedTitle === todo.title) {
      setEditingTitle(false);
    }

    if (preparedTitle.length === 0) {
      handleDeleteButton(todo.id);

      return;
    }

    const updatedTodo = { ...todo, title: preparedTitle };

    //toggle completed or not todo
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

    if (preparedTitle === todo.title) {
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
      setTitleInputValue(todo.title);
    }
  }, [editingTitle, todo.title]);

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: todo.completed,
      })}
    >
      <label className="todo__status-label" aria-label="toggle todo completion">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className={classNames('todo__status')}
          checked={todo.completed}
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
            {todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleDeleteButton(todo.id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': loadingTodo && loadingTodoId.includes(todo.id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
