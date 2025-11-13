import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit {
  
  ngAfterViewInit() {
    // Set up Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          // Remove 'visible' class when scrolling back up for fade-out effect
          entry.target.classList.remove('visible');
        }
      });
    }, observerOptions);

    // Observe feature cards and sections
    const fadeElements = document.querySelectorAll('.fade-in-section, .feature-card');
    fadeElements.forEach(el => observer.observe(el));
  }
}
