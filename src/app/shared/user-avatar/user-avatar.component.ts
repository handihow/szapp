import { Component, OnInit, Input } from '@angular/core';

import { User } from '../../auth/user.model';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent implements OnInit {

  @Input() user: User;
  fallback: string;
  avatar: string;

  constructor() { }

  ngOnInit() {
  	this.fallback = 'https://ui-avatars.com/api/?name='+this.user.displayName;
  	this.avatar = this.user.photoURL ?this.user.photoURL :this.fallback;
  }

  errorHandler(error){
  	console.log('error detected');
  }

}
