import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeComponent } from './home.component';

@Component({
  selector: 'app-home',
  imports: [HomeComponent, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

}
