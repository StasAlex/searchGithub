import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, pluck, catchError, filter } from 'rxjs/operators';
import { EMPTY } from 'rxjs';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  constructor(private http: HttpClient) {}
  formValue = '';
  url = 'https://api.github.com/search/users?q=';
  userForm = new FormGroup({
    userName: new FormControl('')
  });

  userStream$: any = this.userForm.valueChanges.pipe(
    debounceTime(1000), // задерживает поток на 1000мс
    pluck('userName'), // берет из потока ключи полей userName
    distinctUntilChanged(), // сравнивает элемент потока с предыдущим
    // и испускает только значения, отличающиеся от предыдущего
    filter(v => v.trim()), // фильтруем стрим от пустых значений
    // не отправляет запрос если внутри пустое значение и
    // userName = ""
    switchMap(v =>
      this.http
        .get(this.url + v) // формирует новый поток  - берет значение
                          // из предыдущего и вставляет в новый поток
        .pipe(
          catchError(err => EMPTY) // обрабатывает ошибку если отправляется
          // запрос с пустым значением
        )
    ),
    pluck('items') // берет из потока ключи полей items
  );

  ngOnInit() {}
}
