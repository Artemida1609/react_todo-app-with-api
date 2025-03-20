import React, { FormEventHandler, useEffect, useState } from 'react';
import { addTodo, updateTodo, USER_ID } from '../api/todos';
import { Todo } from '../types/Todo';
import classNames from 'classnames';

type Props = {
  setErrorMessage: (arg: string) => void;
  todos: Todo[];
  setTodos: (arg: Todo[]) => void;
  setLoadingTodoId: (arg: number[]) => void;
  inputFocus: React.RefObject<HTMLInputElement>;
  inputValue: string;
  setInputValue: (arg: string) => void;
  setFilteredTodos: (arg: Todo[]) => void;
};

export const Header: React.FC<Props> = ({
  setErrorMessage,
  todos,
  setTodos,
  setLoadingTodoId,
  inputFocus,
  inputValue,
  setInputValue,
  setFilteredTodos,
}) => {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    if (inputValue.trim().length === 0) {
      setErrorMessage('Title should not be empty');

      return;
    } else {
      const newTodo: Omit<Todo, 'id' | 'completed'> = {
        userId: USER_ID,
        title: inputValue.trim(),
      };
      const tempTodo: Todo = {
        id: Date.now(),
        userId: USER_ID,
        title: inputValue.trim(),
        completed: false,
      };

      setDisabled(true);
      setLoadingTodoId([tempTodo.id]);
      setFilteredTodos([...todos, tempTodo]);

      addTodo(newTodo)
        .then(newTodoFromServer => {
          setTodos([...todos, newTodoFromServer]);
          setFilteredTodos([...todos, newTodoFromServer]);
          setLoadingTodoId([]);
          setDisabled(false);
          setInputValue('');
        })
        .catch(() => {
          setErrorMessage('Unable to add a todo');
          setTodos(todos.slice(0, todos.length));
          setFilteredTodos(todos.slice(0, todos.length));
          setDisabled(false);

          setTimeout(() => {
            inputFocus.current?.focus();
          }, 0);
        });
    }
  };

  const handleToggleAll = () => {
    let todosToToggle = [];
    const activeTodos = todos.filter(todoElem => !todoElem.completed);

    if (activeTodos.length > 0) {
      todosToToggle = [...activeTodos];
    } else {
      todosToToggle = todos.filter(todoEl => todoEl.completed);
    }

    const todosId = todosToToggle.map(todoElem => todoElem.id);

    setLoadingTodoId(todosId);

    Promise.allSettled(
      todosToToggle.map(todo => {
        const updatedTodo = { ...todo, completed: !todo.completed };

        return updateTodo(updatedTodo);
      }),
    )
      .then(results => {
        const updatedTodos = todos.map(todo => {
          const updatedTodoResult = results.find(
            res => res.status === 'fulfilled' && res.value?.id === todo.id,
          );

          return updatedTodoResult
            ? { ...todo, completed: !todo.completed }
            : todo;
        });

        setTodos(updatedTodos);
        setFilteredTodos(updatedTodos);
        setLoadingTodoId([]);
      })
      .catch(() => setErrorMessage('Unable to update a todo'));
  };

  useEffect(() => {
    if (inputFocus.current) {
      inputFocus.current.focus();
    }
  }, [todos.length, inputValue, inputFocus]);

  const allTodosActive =
    todos.length === todos.filter(todoItem => todoItem.completed).length;

  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: allTodosActive,
          })}
          data-cy="ToggleAllButton"
          onClick={handleToggleAll}
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          ref={inputFocus}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={disabled}
        />
      </form>
    </header>
  );
};
